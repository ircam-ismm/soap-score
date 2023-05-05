import { render } from 'lit';
import { Transport } from '@ircam/sc-scheduling';

import SoapEngine from './SoapEngine.js';
import layout from './views/layout.js';

import midi2soap from '../../src/parsers/midi2soap.js';
import augustin2soap from '../../src/parsers/augustin2soap.js';
import soap2asco from '../../src/parsers/soap2asco.js';

export default class Application {
  constructor(audioContext, getTimeFunction, scheduler, defaultScore, scoreList, syntaxDoc) {

    this.audioContext = audioContext;
    this.getTime = getTimeFunction;
    this.scheduler = scheduler;
    this.transport = new Transport(scheduler);

    this.syntaxDoc = syntaxDoc;

    this.soapEngine = null;

    this.model = {
      score: defaultScore,
      scoreList: scoreList,
      displayActiveBeat: false,
      transportState: 'stop',
      seekLocation: {
        bar: 1,
        beat: 1,
      },
      loopState: {
        start: {
          bar: 1,
          beat: 1,
        },
        end: {
          bar: 2,
          beat: 1,
        },
      },
      generatedScore: {
        tempo: 60,
        signatureUpper: 4,
        signatureLower: 4,
        basis: '1/4',
      },
      sonificationMode: 'auto',
      sound: 'sine',
      duration: 0,
    };

    this.getTransportPosition = this.getTransportPosition.bind(this);
    this.getPositionInAbsoluteEvent = this.getPositionInAbsoluteEvent.bind(this);
    this.getTempoPosition = this.getTempoPosition.bind(this);

    // for the chenillard (should be cleaned)
    this._current = { position: null, duration: null };
    this._next = null;
    this._direction = true;

    this.setScore(defaultScore);

    window.addEventListener('resize', () => this.render());
  }

  setScore(newScore) {
    // reset transport
    const now = this.getTime();
    this.transport.pause(now);
    this.transport.seek(now, 0);

    if (this.transport.has(this.soapEngine)) {
      this.transport.remove(this.soapEngine);
    }

    const soapEngine = new SoapEngine(this.audioContext, newScore, this);
    this.transport.add(soapEngine);

    this.model.score = newScore;
    this.soapEngine = soapEngine;

    this.model.transportState = 'stop';

    {
      // if the score doesn't start on bar 1
      const { bar, beat } = soapEngine.interpreter.score[0]
      this.model.seekLocation.bar = bar;
      this.model.seekLocation.beat = beat;
    }

    {
      const { bar, beat } = this.model.loopState.start;
      this.transport.loopStart = this.soapEngine.interpreter.getPositionAtLocation(bar, beat);
    }

    {
      const { bar, beat } = this.model.loopState.end;
      this.transport.loopEnd = this.soapEngine.interpreter.getPositionAtLocation(bar, beat);
    }

    this.render();
  }

  parseMidi(file) {
    const score = midi2soap.readString(file);
    // console.log(midi2soap.outputLineForDebug(file));
    // console.log(score);
    this.setScore(score);
  }

  parseAugustin(file) {
    const name = Object.keys(file)[0];
    const data = file[name].toString();
    const score = augustin2soap.readString(data, name);
    this.setScore(score);
  }

  setTransportState(state) {
    const now = this.getTime() + 0.100;

    switch (state) {
      case 'play': {
        this.transport.cancel(now);
        this.transport.play(now);
        break;
      }
      case 'stop': {
        const { bar, beat } = this.model.seekLocation;
        const pos = this.soapEngine.interpreter.getPositionAtLocation(bar, beat);

        this.transport.cancel(now);
        this.transport.pause(now);
        this.transport.seek(now, pos);
        break;
      }
    }
  }

  getTransportState() {
    return this.transport.getState().currentState.speed === 0 ? 'stop' : 'play';
  }

  getTransportPosition() {
    return this.transport.getPositionAtTime(this.getTime());
  }

  getTempoPosition() {
    // this is shit sorry
    if (this.soapEngine.current) {
      const now = this.transport.getPositionAtTime(this.getTime());
      const { position, duration, beat } = this.soapEngine.current;

      // console.log(this._current)
      if (position !== this._current.position && Math.floor(beat) === beat) {
        this._next = { position, duration };
      }

      // console.log(this._next)
      if (this._next && now >= this._next.position) {
        this._current = this._next;
        this._next = null;
        this._direction = !this._direction;
      }

      const norm = (now - this._current.position) / this._current.duration;

      if (this._direction) {
        return 1 - norm;
      } else {
        return norm;
      }
    } else {
      return 0;
    }
  }

  getPositionInAbsoluteEvent() {
    if (!this.soapEngine.current) {
      return 0;
    }

    const duration = this.soapEngine.current.duration;
    const { bar, beat, interpreter } = this.soapEngine;
    const startPosition = interpreter.getPositionAtLocation(bar, beat);
    const currentPosition = this.getTransportPosition();

    const now = currentPosition - startPosition;

    return now;
  }

  setTransportLoop(value) {
    this.transport.loop(this.getTime(), value);
  }

  setLoopStartLocation(bar, beat) {
    this.model.loopState.start.bar = bar;
    this.model.loopState.start.beat = beat;

    const position = this.soapEngine.interpreter.getPositionAtLocation(bar, beat);
    this.transport.loopStart = position;
  }

  setLoopEndLocation(bar, beat) {
    this.model.loopState.end.bar = bar;
    this.model.loopState.end.beat = beat;

    const position = this.soapEngine.interpreter.getPositionAtLocation(bar, beat);
    this.transport.loopEnd = position;
  }

  generateScore(key, value) {
    this.model.generatedScore[key] = value;

    const { signatureUpper, signatureLower, basis, tempo } = this.model.generatedScore;
    const score = `BAR 1 [${signatureUpper}/${signatureLower}] TEMPO [${basis}]=${tempo}`;

    this.setScore(score);
  }

  setSonificationMode(mode) {
    this.model.sonificationMode = mode;
  }

  setMetroSound(sound) {
    this.model.sound = sound;
  }

  jumpToLabel(label) {
    const now = this.getTime();
    const position = this.soapEngine.interpreter.getPositionAtLabel(label);
    const location = this.soapEngine.interpreter.getLocationAtLabel(label);

    this.model.seekLocation = location;

    this.transport.pause(now);
    this.transport.seek(now, position);

    this.model.transportState = 'stop';

    this.render();
  }

  seekToLocation(bar, beat) {
    const now = this.getTime() + 0.05;

    this.model.seekLocation.bar = bar;
    this.model.seekLocation.beat = beat;

    const position = this.soapEngine.interpreter.getPositionAtLocation(bar, beat);

    this.transport.seek(now, position);
  }

  savetoDisk() {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.model.score));
    element.setAttribute('download', 'score.soap');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  copyToClipboard() {
    const { origin, pathname } = window.location;
    let url = `${origin}${pathname}`;

    const encoded = encodeURIComponent(this.model.score);
    url += `?score=${encoded}`;

    navigator.clipboard.writeText(url);
  }

  exportToAntescofo() {
    const asco = soap2asco.parse(this.model.score);
    // console.log(asco);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(asco));
    element.setAttribute('download', 'score.asco');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

  }

  render() {
    render(layout(this), document.body);
  }
}
