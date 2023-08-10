import SoapScoreInterpreter from '../../../../src/SoapScoreInterpreter.js';
import { AudioBufferLoader } from 'waves-loaders';

export default class SoapEngine {
  constructor(audioContext, score, application) {
    this.audioContext = audioContext;
    this.interpreter = new SoapScoreInterpreter(score);
    this.application = application;

    // create transport dedicated to fermata

    this.bar = 1;
    this.beat = 1;
    this.current = null;
    this.next = null;

    // load buffers
    this.sound = {
      files: [
        './assets/bell.wav',
        './assets/kick.wav',
        './assets/rimshot.wav',
        './assets/sidestik.wav',
        './assets/old-numerical.wav',
        './assets/mechanical-001.wav',
        './assets/mechanical-002.wav',
        './assets/mechanical-003.wav',
        './assets/mechanical-004.wav',
        './assets/mechanical-005.wav',
        './assets/mechanical-006.wav',
        './assets/mechanical-007.wav',
        './assets/mechanical-008.wav',
        './assets/mechanical-009.wav',
        './assets/mechanical-010.wav',
        './assets/mechanical-011.wav',
        './assets/mechanical-012.wav',
        './assets/mechanical-013.wav',
        './assets/mechanical-014.wav',
        './assets/mechanical-015.wav',
        './assets/mechanical-016.wav',
        './assets/mechanical-017.wav',
        './assets/mechanical-018.wav',
        './assets/mechanical-019.wav',
        './assets/mechanical-020.wav',
        './assets/mechanical-021.wav',
        './assets/mechanical-022.wav',
        './assets/mechanical-023.wav',
        './assets/mechanical-024.wav',
        './assets/mechanical-025.wav',
        './assets/mechanical-026.wav',
        './assets/drumstick.wav',
      ],
      buffers: {},
    };
    this.loadAudioBuffers();
  }

  async loadAudioBuffers() {
    const loader = new AudioBufferLoader();
    const buffers = await loader.load(this.sound.files);

    this.sound.files.forEach((path, index) => {
      const filename = path.split('/')[2];
      this.sound.buffers[filename] = buffers[index];
    });

  }

  onTransportEvent(event, position, audioTime, dt) {
    if (event.type === 'play' || event.type === 'seek') {
      const { bar, beat } = this.interpreter.getLocationAtPosition(position);
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

    if (event.type === 'loop') {
      const { bar, beat } = this.interpreter.getLocationAtPosition(event.loopStart);
      const infos = this.interpreter.getLocationInfos(bar, beat);

      this.current = infos;
      this.bar = infos.bar;
      this.beat = infos.beat;
      this.next = null;
    }

    if (event.speed > 0) {
      this.application.model.transportState = 'play';
    } else {
      this.application.model.transportState = 'stop';
    }

    this.application.model.displayActiveBeat = false;
    this.application.render();

    if (event.speed > 0) {
      return this.current.position;
    } else {
      return Infinity;
    }
  }

  advanceTime(position, audioTime, dt) {
    const { bar, beat } = this.interpreter.getLocationAtPosition(position);

    // if { bar beat } is below current location, where are in a loop
    if (bar < this.bar || (bar === this.bar && beat < this.beat)) {
      this.next = this.interpreter.getLocationInfos(bar, beat);
    }

    if (this.next) {
      this.current = this.next;
      this.bar = this.next.bar;
      this.beat = this.next.beat;
      this.next = null;
    }

    let sonificationMode = this.application.model.sonificationMode;

    if (this.current.event.fermata) {
      sonificationMode = 'beat';
    }

    // do not sonify event in between beats
    if (Math.abs(this.beat - Math.floor(this.beat)) < 1e-3) {
      const freq = this.beat === 1 ? 900 : 600;
      const gain = this.beat === 1 ? 1 : 0.4;

      if (!this.current.event.tempo) {
        this._triggerBeat(audioTime, freq, 1);
        this.application.model.displayActiveBeat = false;
        this.application.render();
        // update values for next call, we don't update right now as we want to
        // display the right infos
        this.next = this.interpreter.getNextLocationInfos(this.bar, this.beat);

        return position + this.current.dt;
      }

      // Computed unit according to signature, e.g.:
      // BAR 1 [6/8] TEMPO [1/8]=80 will have a unit of [3/8]
      //
      // In case of irregular mesure, unit.upper is adapted to contain the number
      // units for this particular beat, e.g.:
      // BAR 1 [5/8] TEMPO [1/8]=80 will be [3/8] on first beat and [2/8] on the second one
      let { upper, lower } = this.current.unit;

      switch (this.application.model.sonificationMode) {
        case 'auto':
          if (this.current.event.tempo.curve === null) {
            this._triggerBeat(audioTime, freq, 1);
          } else {
            // same as 'double'
            this._triggerBeat(audioTime, freq, 1);

            if (upper === 1) {
              upper = 2;
            };

            const delta = this.current.duration / upper;

            for (let i = 1; i < upper; i++) {
              const subBeatTime = audioTime + i * delta;
              this._triggerBeat(subBeatTime, 1200, 0.3);
            }
          }
          break;
        case 'double':
          this._triggerBeat(audioTime, freq, 1);

          if (upper === 1) {
            upper = 2;
          };

          const delta = this.current.duration / upper;

          for (let i = 1; i < upper; i++) {
            const subBeatTime = audioTime + i * delta;
            this._triggerBeat(subBeatTime, 1200, 0.3);
          }
          break;
        case 'beat':
          this._triggerBeat(audioTime, freq, 1);
          break;
        case 'bar':
          if (this.beat === 1) {
            this._triggerBeat(audioTime, freq, 1);
          }
          break;
        case 'odd':
          if (this.beat % 2 === 1) {
            this._triggerBeat(audioTime, freq, 1);
          }
          break;
        case 'even':
          if (this.beat % 2 === 0) {
            this._triggerBeat(audioTime, freq, 1);
          }
          break;
      }


      setTimeout(() => {
        this.application.model.displayActiveBeat = true;
        this.application.render();
      }, dt);
    } else {
      setTimeout(() => {
        this.application.model.displayActiveBeat = false;
        this.application.render();
      }, dt);
    }

    // update values for next call, we don't update right now as we want to
    // display the right infos
    this.next = this.interpreter.getNextLocationInfos(this.bar, this.beat);

    // handle end of score
    if (this.next === null) {
      const { transport, scheduler } = this.application;
      const currentTime = scheduler.currentTime;
      transport.pause(currentTime + this.current.duration);
      transport.seek(currentTime + this.current.duration, 0);
      return Infinity;
    }

    if (this.current.event.fermata) {
      const { duration, dt } = this.current;
      const { transport, scheduler } = this.application;
      const currentTime = scheduler.currentTime;

      transport.pause(currentTime + duration);
      // this 0.120 is arbitrary, but it appears more natural after the upbeats
      transport.play(currentTime + dt + 0.120);

      const nextTempo = 60 / this.next.event.tempo.bpm;
      // sonofy two events before restarting flow
      for (let i = 1; i < 3; i++) {
        const upBeatTime = currentTime + dt - nextTempo * i;

        scheduler.defer((currentTime, audioTime, dt) => {
          this._triggerBeat(audioTime + dt, 1200, 0.3);

          setTimeout(() => {
            this.application.model.displayActiveBeat = true;
            this.application.render();
          }, dt * 1000);
        }, upBeatTime);
      }
      return Infinity;
    }

    return position + this.current.dt;
  }

  _triggerBeat(audioTime, freq, gain) {
    // audio feeedback
    switch(this.application.model.sound) {
      case 'sine':
      {
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
        break;
      }
      default:
      {
        let sound;
        switch(this.application.model.sound) {
        case 'drum':
          sound = (freq === 900) ? 'bell.wav' : (freq === 600) ? 'kick.wav' : 'sidestik.wav';
          break;
        case 'old-numerical':
          sound = 'old-numerical.wav';
          break;
        case 'mechanical':
          const rand = Math.ceil(Math.random() * 26);
          const randStr = ("00" + rand).slice(-3);
          sound = `mechanical-${randStr.toString()}.wav`;
          break;
        case 'drumstick':
          sound = 'drumstick.wav';
          break;
        }
        const buffer = this.sound.buffers[sound];
        const env = this.audioContext.createGain();
        env.connect(this.audioContext.destination);
        env.gain.value = gain;
        const src = this.audioContext.createBufferSource();
        src.connect(env);
        src.buffer = buffer;
        src.start(audioTime);
        break;
      }
    }
  }

};

