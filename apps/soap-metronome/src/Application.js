import { render } from 'lit';
import { Transport } from '@ircam/sc-scheduling';
import toWav from 'audiobuffer-to-wav';

import conductorLayout from './views/conductor-layout.js';

import SoapEngine from './engines/SoapEngine.js';
import MTCSend from './engines/MTCSend.js';
import MTCReceive from './engines/MTCReceive.js';

import SoapScoreInterpreter from '../../../src/SoapScoreInterpreter.js';
import midi2soap from '../../../src/parsers/midi2soap.js';
import augustin2soap from '../../../src/parsers/augustin2soap.js';
import soap2asco from '../../../src/parsers/soap2asco.js';

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
      mtcParams: {
        framerate: 25,
        ticksPerFrame: 4,
        maxDriftError: 8,
        lookAhead: 30,
        inputInterface: '',
        outputInterface: '',
      },
      midiDeviceList: {
        inputs: [],
        outputs: [],
      },
    };

    // for MTC
    this.mtcSend = null; // Class
    this.mtcReceive = null; // Class

    this.getTransportPosition = this.getTransportPosition.bind(this);
    this.getNormPositionInEvent = this.getNormPositionInEvent.bind(this);

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

  createMTCSend() {
    this.setTransportState('stop');
    this.mtcSend = new MTCSend(this.getTime, this.transport, this.model.mtcParams);
    this.transport.add(this.mtcSend);
    this.render();
  }

  deleteMTCSend() {
    this.transport.remove(this.mtcSend);
    this.mtcSend.closeEngine();
    this.mtcSend = null;
    this.setTransportState('stop');
  }

  createMTCReceive() {
    this.setTransportState('stop');

    this.mtcReceive = new MTCReceive(this.getTime, this.transport, this.model.mtcParams, {
      onStart: (time) => {
        this.transport.cancel(time);
        this.transport.play(time);
      },
      onSeek: (time, position) => {
        // seek is asap
        this.transport.cancel(time);
        this.transport.pause(time);
        this.transport.seek(time, position);
      },
      onPause: (time) => {
        this.transport.pause(time);
      }
    });
    this.transport.add(this.mtcReceive);
    this.render();
  }

  deleteMTCReceive() {
    this.transport.remove(this.mtcReceive);
    this.mtcReceive.closeEngine();
    this.mtcReceive = null;
    this.setTransportState('stop');
  }

  midiAccessIsSuccess(webmidi) {
    webmidi.outputs.forEach(port => {
      this.model.midiDeviceList.outputs.push(port.name);
    });
    webmidi.inputs.forEach(port => {
      this.model.midiDeviceList.inputs.push(port.name);
    });

    this.model.mtcParams.inputInterface = this.model.midiDeviceList.inputs[0];
    this.model.mtcParams.outputInterface = this.model.midiDeviceList.outputs[0];

    this.render();
  }

  midiAccessIsFailed() {
    throw new Error("midi access failed");
  }

  parseMidi(file) {
    const score = midi2soap.readString(file);
    this.setScore(score);
  }

  parseAugustin(file, name) {
    const score = augustin2soap.readString(file, name);
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

  setTransportSpeed(value) {
    const now = this.getTime() + 0.100;

    this.transport.speed(now, value);
  }

  getTransportPosition() {
    return this.transport.getPositionAtTime(this.transport.currentTime);
  }

  // return normalized position in event, for the schenillard
  getNormPositionInEvent() {
    if (!this.soapEngine.current) {
      return 0;
    }

    const duration = this.soapEngine.current.duration;
    const { bar, beat, interpreter } = this.soapEngine;
    const startPosition = interpreter.getPositionAtLocation(bar, beat);
    const currentPosition = this.getTransportPosition();

    let normPosition = (currentPosition - startPosition) / duration;

    if (beat % 2 === 0) {
      normPosition = 1 - normPosition;
    }

    return normPosition;
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

  async exportAudioFile() {
    const score = this.model.score;
    const interpreter = new SoapScoreInterpreter(score);
    // check that score has an end
    const lastEvent = interpreter.score[interpreter.score.length - 1];

    if (lastEvent.end !== true) {
      throw new Error(`Cannot export file, no END tag found`);
    }

    const duration = interpreter.getPositionAtLocation(lastEvent.bar + 1, 1);
    const sampleRate = 48000;
    const audioContext = new OfflineAudioContext({
      numberOfChannels: 1,
      sampleRate: sampleRate,
      length: Math.ceil(duration * sampleRate),
    });

    // find first event
    const { bar, beat } = interpreter.getLocationAtPosition(0);
    let infos = interpreter.getLocationInfos(bar, beat);

    while (infos !== null) {
      const { bar, beat, position } = infos;
      // ignore in between events
      if (Math.abs(beat - Math.floor(beat)) < 1e-3) {
        const audioTime = position;

        const freq = beat === 1 ? 900 : 600;
        const gain = beat === 1 ? 1 : 0.4;
        // produce the click for this beat
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

      infos = interpreter.getNextLocationInfos(bar, beat);
    }

    const buffer = await audioContext.startRendering();
    const wav = toWav(buffer);
    const wavObjectURL = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));

    const element = document.createElement('a');
    element.setAttribute('href', wavObjectURL);
    element.setAttribute('download', 'score.wav');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  render() {
    render(conductorLayout(this), document.body);
  }
}
