class MetronomeRenderer {
  constructor(audioContext, audioOutput, buffers) {
    this.audioContext = audioContext;
    this.audioOutput = audioOutput;
    this.buffers = buffers;

    this.sonification = 'sine';
    this.sonificationMode = 'auto';
  }

  scheduleSubBeats(audioTime, infos) {
    let upper = infos.unit.upper;
    const duration = infos.duration;
    if (upper === 1) {
      upper = 2;
    }

    const delta = duration / upper;

    for (let i = 1; i < upper; i++) {
      const subBeatTime = audioTime + i * delta;
      this.triggerBeat(subBeatTime, 'subbeat');
    }
  }

  renderBeat(beat, infos, audioTime) {
    const beatType = beat === 1 ? 'downbeat' : 'upbeat';

    switch (this.sonificationMode) {
      case 'auto':
        this.triggerBeat(audioTime, beatType);
        if (infos.event.tempo?.curve) {
          this.scheduleSubBeats(audioTime, infos);
        }
        break;
      case 'double':
        this.triggerBeat(audioTime, beatType);
        this.scheduleSubBeats(audioTime, infos);
        break;
      case 'beat':
        this.triggerBeat(audioTime, beatType);
        break;
      case 'bar':
        if (beat === 1) {
          this.triggerBeat(audioTime, beatType);
        }
        break;
      case 'odd':
        if (beat % 2 === 1) {
          this.triggerBeat(audioTime, beatType);
        }
        break;
      case 'even':
        if (beat % 2 === 0) {
          this.triggerBeat(audioTime, beatType);
        }
        break;
    }
  }

  triggerBeat(audioTime, beatType) {
    audioTime = Math.max(audioTime, this.audioContext.currentTime);

    if (this.sonification === 'sine') {
      let freq;
      switch (beatType) {
        case 'downbeat':
          freq = 900;
          break;
        case 'upbeat':
          freq = 600;
          break;
        case 'subbeat':
          freq = 1200;
          break;
      }

      const gain = 1;

      const env = this.audioContext.createGain();
      env.connect(this.audioOutput);
      env.gain.value = 0;
      env.gain.setValueAtTime(0, audioTime);
      env.gain.linearRampToValueAtTime(gain, audioTime + 0.002);
      env.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.100);

      const src = this.audioContext.createOscillator();
      src.connect(env);
      src.frequency.value = freq;
      src.start(audioTime);
      src.stop(audioTime + 0.100);

      return src;
    } else {
      let buffer;
      let gain;
      const buffers = this.buffers[this.sonification];

      switch (this.sonification) {
        case 'drum': {
          if (beatType === 'downbeat') {
            buffer = buffers[0];
          } else if (beatType === 'upbeat') {
            buffer = buffers[1];
          } else if (beatType === 'subbeat') {
            buffer = buffers[2];
          }

          gain = 1;
          break;
        }
        case 'mechanical': {
          buffer = buffers[Math.floor(Math.random() * buffers.length)];

          switch (beatType) {
            case 'downbeat':
              gain = 1;
              break;
            case 'upbeat':
              gain = 0.5;
              break;
            case 'subbeat':
              gain = 0.1;
              break;
          }
          break;
        }
        case 'drumstick':
        case 'old-numerical': {
          buffer = buffers;

          switch (beatType) {
            case 'downbeat':
              gain = 1;
              break;
            case 'upbeat':
              gain = 0.5;
              break;
            case 'subbeat':
              gain = 0.1;
              break;
          }
          break;
        }
      }

      const env = this.audioContext.createGain();
      env.connect(this.audioOutput);
      env.gain.value = gain;

      const src = this.audioContext.createBufferSource();
      src.connect(env);
      src.buffer = buffer;
      src.start(audioTime);

      return src;
    }
  }
}

export default MetronomeRenderer;
