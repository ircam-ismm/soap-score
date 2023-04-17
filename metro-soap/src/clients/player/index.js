import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { getTime } from '@ircam/sc-gettime';

import pluginSyncFactory from '@soundworks/plugin-sync/client.js';
import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';

import createLayout from './views/layout.js';

import { Scheduler, Transport } from '@ircam/sc-scheduling';

import SoapScoreInterpreter from '../../../../src/SoapScoreInterpreter.js';
import * as fixtures from '../../../../tests/fixtures.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

/**
 * Grab the configuration object written by the server in the `index.html`
 */
const config = window.SOUNDWORKS_CONFIG;

/**
 * If multiple clients are emulated you might to want to share some resources
 */
const audioContext = new AudioContext();

const getAudioTime = () => audioContext.currentTime;
const scheduler = new Scheduler(getAudioTime);
const transport = new Transport(scheduler);

let score = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 2 |2.5 "coucou"
BAR 3 "next bar is 120"
BAR 4 [4/4] TEMPO [1/4]=120`;

let soapEngine = null;

class SoapEngine {
  constructor(score) {
    this.interpreter = new SoapScoreInterpreter(score);
    this.bar = 1;
    this.beat = 1;
    this.current = null;
    this.next = null;
    this.sonifySubBeats = false;
  }

  onTransportEvent(event, position, audioTime, dt) {
    // to do - handle stop / seek correctly for display
    const { bar, beat } = this.interpreter.getLocationAtPosition(position);

    if (event.speed > 0) {
      let infos;

      if (Math.floor(beat) === beat) {
        infos = this.interpreter.getLocationInfos(bar, beat);
      } else {
        infos = this.interpreter.getNextLocationInfos(bar, beat);
      }

      this.next = infos;

      renderScreen(false);

      return infos.position;
    } else {


      return Infinity;
    }
  }

  advanceTime(position, audioTime, dt) {
    if (this.next) {
      this.current = this.next;
      this.bar = this.next.bar;
      this.beat = this.next.beat;
      this.next = null;
    }

    // do not sonify event in between beats
    if (Math.floor(this.beat) === this.beat) {
      const freq = this.beat === 1 ? 900 : 600;
      this._triggerBeat(audioTime, freq, 1);

      if (this.sonifySubBeats === true) {
        // if tempo basis is one unit, e.g. [1/4], just devide it by 2, i.e. [1/8]
        // don't see what could go wrong here
        let { upper, lower } = this.current.basis;

        if (upper === 1) {
          upper = 2;
        }

        const delta = this.current.duration / upper;

        for (let i = 1; i < upper; i++) {
          const subBeatTime = audioTime + i * delta;
          this._triggerBeat(subBeatTime, 1200, 0.5);
        }
      }

      // this is weird...
      setTimeout(() => {
        renderScreen(true);
        setTimeout(() => renderScreen(false), 20);
      }, dt);
    } else {
      setTimeout(() => renderScreen(false), dt);
    }

    // update values for next call, we don't update right now as we want to
    // display the right infos
    this.next = this.interpreter.getNextLocationInfos(this.bar, this.beat);

    return position + this.current.duration;
  }

  _triggerBeat(audioTime, freq, gain) {
    // audio feeedback
    const env = audioContext.createGain();
    env.connect(audioContext.destination);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, audioTime);
    env.gain.linearRampToValueAtTime(gain, audioTime + 0.002);
    env.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.100);

    const src = audioContext.createOscillator();
    src.connect(env);
    src.frequency.value = freq;
    src.start(audioTime);
    src.stop(audioTime + 0.100);
  }
};

function setScore(newScore) {
  score = newScore;

  // reset transport
  const now = getTime();
  transport.pause(now);
  transport.seek(now, 0);

  if (transport.has(soapEngine)) {
    transport.remove(soapEngine);
  }

  console.log(score);
  soapEngine = new SoapEngine(score);
  transport.add(soapEngine);

  renderScreen();
}


function renderScreen(active = false) {
  render(html`
    <h2>SO(a)P player</h2>

    <sc-transport
      buttons="[play, pause, stop]"
      state="stop"
      @change=${e => {
        const now = getTime();

        switch (e.detail.value) {
          case 'play': {
            transport.play(now);
            break;
          }
          case 'pause': {
            transport.pause(now);
            break;
          }
          case 'stop': {
            transport.pause(now);
            transport.seek(now, 0);
            break;
          }
        }
      }}
    ></sc-transport>

    <sc-clock
      style="margin: 4px 0; display: block;"
      .getTimeFunction=${() => transport.getPositionAtTime(getTime())}
      font-size="20"
      twinkle="[0, 0.5]"
    ></sc-clock>

    <div style="margin: 4px 0;">
      <sc-number
        integer
        min="0"
        max="1000"
        value="${soapEngine.bar}"
      ></sc-number>
      <sc-number
        integer
        min="0"
        max="1000"
        value="${soapEngine.beat}"
      ></sc-number>
      <sc-bang
        ?active="${active}"
      ></sc-bang>
    </div>

    <div>
      <sc-text
        value="labels:"
        readonly
      ></sc-text>
      <sc-text
        value="${soapEngine.current && soapEngine.current.event ? soapEngine.current.event.label : ''}"
        readonly
      ></sc-text>
    </div>

    <div style="margin: 4px 0;">
      <sc-text
        value="sonify sub-beats"
        readonly
      ></sc-text>
      <sc-toggle
        ?active=${soapEngine.sonifySubBeats}
        @change=${e => soapEngine.sonifySubBeats = e.detail.value}
      ></sc-toggle>
    </div>

    <div style="margin: 4px 0;">
      <sc-editor
        value="${score}"
        @change="${e => setScore(e.detail.value)}"
      ></sc-editor>
    </div>

    <div style="margin: 4px 0;">
      ${Object.keys(scores).map(name => {
        return html`<sc-button
          style="padding-bottom: 2px;"
          value="${name}"
          @input=${e => setScore(scores[name])}
        ></sc-button>
        `;
      })}
    </div>

<!--     <sc-slider
      width="800"
      height="100"
      min="0"
      max="1"
      value="0"
    ></sc-slider>
 -->
  `, document.body);
}

async function main($container) {
  /**
   * Create the soundworks client
   */
  const client = new Client(config);

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);
  // client.pluginManager.register('sync', pluginSyncFactory, {
    // getTimeFunction: getTime,
    // }, []);
  client.pluginManager.register('platform-init', pluginPlatformInit, { audioContext });


  /**
   * Register the soundworks client into the launcher
   *
   * The launcher will do a bunch of stuff for you:
   * - Display default initialization screens. If you want to change the provided
   * initialization screens, you can import all the helpers directly in your
   * application by doing `npx soundworks --eject-helpers`. You can also
   * customise some global syles variables (background-color, text color etc.)
   * in `src/clients/components/css/app.scss`.
   * You can also change the default language of the intialization screen by
   * setting, the `launcher.language` property, e.g.:
   * `launcher.language = 'fr'`
   * - By default the launcher automatically reloads the client when the socket
   * closes or when the page is hidden. Such behavior can be quite important in
   * performance situation where you don't want some phone getting stuck making
   * noise without having any way left to stop it... Also be aware that a page
   * in a background tab will have all its timers (setTimeout, etc.) put in very
   * low priority, messing any scheduled events.
   */
  launcher.register(client, { initScreensContainer: $container });

  /**
   * Launch application
   */
  await client.start();

  // The `$layout` is provided as a convenience and is not required by soundworks,
  // its full source code is located in the `./views/layout.js` file, so feel free
  // to edit it to match your needs or even to delete it.
  const $layout = createLayout(client, $container);

  setScore(score);

  // do your own stuff!
}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});
