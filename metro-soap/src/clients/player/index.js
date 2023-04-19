import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import pluginSyncFactory from '@soundworks/plugin-sync/client.js';
import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';

import createLayout from './views/layout.js';

import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { getTime } from '@ircam/sc-gettime';

import SoapScoreInterpreter from '../../../../src/SoapScoreInterpreter.js';
import * as fixtures from '../../../../tests/fixtures.js';

import SoapEngine from '../../../../soap-player/src/SoapEngine.js';
import { renderScreen } from '../../../../soap-player/src/view.js';
import '../../../../soap-player/src/sc-clock.js';

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

async function main($container) {
  /**
   * Create the soundworks client
   */
  const client = new Client(config);
  const getTime = () => audioContext.currentTime;

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  client.pluginManager.register('platform-init', pluginPlatformInit, {
    audioContext
  });

  client.pluginManager.register('sync', pluginSyncFactory, {
    getTimeFunction: getTime,
  }, ['platform-init']);

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

  const globals = await client.stateManager.attach('globals');
  const sync = await client.pluginManager.get('sync');

  const getSyncTime = () => sync.getSyncTime();
  const scheduler = new Scheduler(getSyncTime, {
    currentTimeToAudioTimeFunction: currentTime => sync.getLocalTime(currentTime),
  });

  const transport = new Transport(scheduler);
  // this must be done only at initialization
  transport.setState(globals.get('transportState'));

  const score = globals.get('score');
  const testScores = globals.get('scores');

  // The `$layout` is provided as a convenience and is not required by soundworks,
  // its full source code is located in the `./views/layout.js` file, so feel free
  // to edit it to match your needs or even to delete it.
  // const $layout = createLayout(client, $container);

  const transportProxy = {
    // delegate time to the server
    play(time) {
      globals.set({ transportCommand: 'play' });
    },
    pause(time) {
      globals.set({ transportCommand: 'pause' });
    },
    seek(time, position) {
      globals.set({
        transportCommand: 'seek',
        seekPosition: position,
      });
    },
    getPositionAtTime(time) {
      return transport.getPositionAtTime(time);
    }
  };

  const viewState = {
    transport: transportProxy,
    score,
    scores: testScores,
    soapEngine: null,
    active: false,
    getTime: getSyncTime,
    setScore: score => globals.set({ score }),
    jumpToLabel: (label) => console.log('@todo - jumpToLabel', label),
  }

  globals.onUpdate(updates => {
    for (let [key, value] of Object.entries(updates)) {
      switch (key) {
        case 'transportEvents': {
          if (value !== null) { // is null on first call
            transport.addEvents(value);
          }

          break;
        }
        case 'score': {
          const score = value;

          const now = getSyncTime();
          transport.pause(now);
          transport.seek(now, 0);

          if (transport.has(viewState.soapEngine)) {
            transport.remove(viewState.soapEngine);
          }

          const soapEngine = new SoapEngine(score, viewState, audioContext);
          transport.add(soapEngine);

          viewState.score = score;
          viewState.soapEngine = soapEngine;
          viewState.transportState = 'stop';

          renderScreen(viewState);
          break;
        }
        default: {
          // console.log('handle update', key, value);
          break;
        }
      }
    }
  }, true);

  // do your own stuff!
}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});
