import "core-js/stable";
import "regenerator-runtime/runtime";
import { render, html } from 'lit/html.js';
import { resumeAudioContext } from '@ircam/resume-audio-context';

import { getTime } from '@ircam/sc-gettime';
import { Scheduler, Transport } from '@ircam/sc-scheduling';

import '@ircam/simple-components/sc-bang.js';
import '@ircam/simple-components/sc-transport.js';
import '@ircam/simple-components/sc-number.js';
import './sc-clock.js';

import SoapScoreInterpreter from '../../src/SoapScoreInterpreter.js';

console.info('> self.crossOriginIsolated', self.crossOriginIsolated);

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();


const getAudioTime = () => audioContext.currentTime;
const scheduler = new Scheduler(getAudioTime);
const transport = new Transport(scheduler);

const score = `
  BAR 1 [4/4] TEMPO [1/4]=90
  BAR 2 [3/4] TEMPO [1/4]=127
  BAR 3 [2/8] TEMPO [1/8]=30
`;
const soapScoreInterpreter = new SoapScoreInterpreter(score);

const soapEngine = {
  bar: 1,
  beat: 1,
  event: null,
  next: null,

  onTransportEvent(event, position, audioTime, dt) {
    // to do - handle stop / seek correctly for display
    const { bar, beat } = soapScoreInterpreter.getLocationAtPosition(position);

    if (event.speed > 0) {
      let infos;

      if (Math.floor(beat) === beat) {
        infos = soapScoreInterpreter.getLocationInfos(bar, beat);
      } else {
        infos = soapScoreInterpreter.getNextLocationInfos(bar, beat);
      }

      this.next = infos;

      renderScreen(false);

      return infos.position;
    } else {


      return Infinity;
    }
  },

  advanceTime(position, currentTime, dt) {
    if (this.next) {
      this.bar = this.next.bar;
      this.beat = this.next.beat;
      this.event = this.next.event;
      this.next = null;
    }

    const basisDuration = 60 / this.event.tempo.bpm;
    const nextPosition = position + basisDuration;

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
    this.next = soapScoreInterpreter.getNextLocationInfos(this.bar, this.beat);

    return nextPosition;
  },
};

transport.add(soapEngine);


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
      style="margin: 4px auto; display: block;"
      .getTimeFunction="${() => transport.getPositionAtTime(getTime())}"
      font-size="20"
      twinkle="[0, 0.5]"
    ></sc-clock>

    <div style="margin-top: 4px;">
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

  `, document.body);
}

(async function main() {
  await resumeAudioContext(audioContext);

  renderScreen();
}());
