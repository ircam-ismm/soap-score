import "core-js/stable";
import "regenerator-runtime/runtime";
import { render, html } from 'lit/html.js';
import { resumeAudioContext } from '@ircam/resume-audio-context';

import { getTime } from '@ircam/sc-gettime';
import { Scheduler, Transport } from '@ircam/sc-scheduling';

import '@ircam/simple-components/sc-bang.js';
import '@ircam/simple-components/sc-transport.js';
import '@ircam/simple-components/sc-number.js';
import '@ircam/simple-components/sc-editor.js';
import '@ircam/simple-components/sc-button.js';
import './sc-clock.js';

import SoapScoreInterpreter from '../../src/SoapScoreInterpreter.js';
import * as fixtures from '../../tests/fixtures.js';

const scores = {};
for (let name in fixtures) {
  if (name.endsWith('Score')) {
    scores[name] = fixtures[name];
  }
}
// console.log(scores);

console.info('> self.crossOriginIsolated', self.crossOriginIsolated);

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();


const getAudioTime = () => audioContext.currentTime;
const scheduler = new Scheduler(getAudioTime);
const transport = new Transport(scheduler);

let score = `BAR 1 [4/4] TEMPO [1/4]=60`;

let soapEngine = null;

class SoapEngine {
  constructor(score) {
    this.interpreter = new SoapScoreInterpreter(score);
    this.bar = 1;
    this.beat = 1;
    this.current = null;
    this.next = null;
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

  advanceTime(position, currentTime, dt) {
    if (this.next) {
      this.current = this.next;
      this.bar = this.next.bar;
      this.beat = this.next.beat;
      this.next = null;
    }

    // audio feeedback
    const env = audioContext.createGain();
    env.connect(audioContext.destination);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, currentTime);
    env.gain.linearRampToValueAtTime(1, currentTime + 0.002);
    env.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.100);

    const src = audioContext.createOscillator();
    src.connect(env);
    src.frequency.value = this.beat === 1 ? 900 : 600;
    src.start(currentTime);
    src.stop(currentTime + 0.100);

    // this is weird...
    setTimeout(() => {
      renderScreen(true);
      setTimeout(() => renderScreen(false), 20);
    }, dt);

    // update values for next call, we don't update right now as we want to
    // display the right infos
    this.next = this.interpreter.getNextLocationInfos(this.bar, this.beat);

    return position + this.current.duration;
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
      .getTimeFunction="${() => transport.getPositionAtTime(getTime())}"
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

    <div style="margin: 4px 0;">
      <sc-editor
        value="${score}"
        @change="${e => setScore(e.detail.value)}"
      ></sc-editor>
    </div>

    <div style="margin: 4px 0;">
      ${Object.keys(scores).map(name => {
        return html`<sc-button
          value="${name}"
          @input="${e => setScore(scores[name])}"
        ></sc-button>
        `;
      })}
    </div>

  `, document.body);
}

(async function main() {
  await resumeAudioContext(audioContext);

  setScore(score);
  // renderScreen();
}());
