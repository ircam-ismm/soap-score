import SoapScoreInterpreter from '../../src/SoapScoreInterpreter.js';
import { renderScreen } from './view.js';

export default class SoapEngine {
  constructor(score, viewState, audioContext) {
    this.interpreter = new SoapScoreInterpreter(score);
    this.bar = 1;
    this.beat = 1;
    this.current = null;
    this.next = null;
    this.sonifySubBeats = false;
    this.viewState = viewState;
    this.audioContext = audioContext;
  }

  onTransportEvent(event, position, audioTime, dt) {
    // to do - handle stop / seek correctly for display
    const { bar, beat } = this.interpreter.getLocationAtPosition(position);

    if (event.type === 'play' || event.type === 'seek') {
      let infos;

      if (Math.floor(beat) === beat) {
        infos = this.interpreter.getLocationInfos(bar, beat);
      } else {
        infos = this.interpreter.getNextLocationInfos(bar, beat);
      }

      this.current = infos;
      this.bar = infos.bar;
      this.beat = infos.beat;
      this.next = null;
    }

    this.viewState.active = true;
    renderScreen(this.viewState);

    if (event.speed > 0) {
      return this.current.position;
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
      const gain = this.beat === 1 ? 1 : 0.4;
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
          this._triggerBeat(subBeatTime, 1200, 0.3);
        }
      }

      setTimeout(() => {
        this.viewState.active = true;
        renderScreen(this.viewState);
      }, dt);
    } else {
      setTimeout(() => {
        this.viewState.active = false;
        renderScreen(this.viewState);
      }, dt);
    }

    // update values for next call, we don't update right now as we want to
    // display the right infos
    this.next = this.interpreter.getNextLocationInfos(this.bar, this.beat);

    return position + this.current.dt;
  }

  _triggerBeat(audioTime, freq, gain) {
    // audio feeedback
    const env = this.audioContext.createGain();
    env.connect(this.audioContext.destination);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, audioTime);
    env.gain.linearRampToValueAtTime(gain, audioTime + 0.002);
    env.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.100);

    const src = this.audioContext.createOscillator();
    src.connect(env);
    src.frequency.value = freq;
    src.start(audioTime);
    src.stop(audioTime + 0.100);
  }
};
