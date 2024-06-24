import { html, LitElement } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-select.js';

class SoapMetronomeRenderer extends LitElement {
  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;
    this.buffers = null;
    this.audioContext = null;
    this.audioOutput = null;
    this.process = this.process.bind(this);

    // 'sine', 'drum', 'old-numerical', 'mechanical', 'drumstick'
    this.sonification = 'sine';
    // @todo
    // 'auto', 'double', 'beat', 'bar', 'odd', 'even'
    this.sonificationMode = 'sine';
  }

  render() {
    const soundbanks = Object.keys(this.buffers);
    soundbanks.unshift('sine');

    // use Math.random() as a hack to trigger the flashes even if we have two
    // consecutive beats with same value, e.g. 2 bars with absolute duration
    return html`
      <sc-select
        .options=${soundbanks}
        value=${this.sonification}
        @change=${e => this.sonification = e.detail.value}
      ></sc-select>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.transport.has(this.process)) {
      this.transport.add(this.process);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.transport.has(this.process)) {
      this.transport.remove(this.process);
    }
  }

  // transport callback
  process(position, audioTime, event) {
    if (event instanceof TransportEvent) {
      return event.speed > 0 ? position : Infinity;
    }

    const { bar, beat } = this.interpreter.getLocationAtPosition(position);
    const infos = this.interpreter.getLocationInfos(bar, beat);

    // do not sonify in between beat events, e.g. labels
    if (Math.floor(beat) === beat) {
      // @todo
      // - handle subbeat
      // - abstract so that it can be used in export to wav
      const type = beat === 1 ? 'downbeat' : 'upbeat';
      this.triggerBeat(audioTime, type);
    }

    return position + infos.dt;
  }

  triggerBeat(audioTime, type, gain) {
    audioTime = Math.max(audioTime, this.audioContext.currentTime);

    if (this.sonification === 'sine') {
      const freq = type === 'downbeat' ? 900 : 600;
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
    } else {
      let buffer;
      let gain;
      const buffers = this.buffers[this.sonification];

      switch (this.sonification) {
        case 'drum': {
          if (type === 'downbeat') {
            buffer = buffers[0];
          } else if (type === 'upbeat') {
            buffer = buffers[1];
          }

          gain = 1;
          break;
        }
        case 'mechanical': {
          const index = Math.floor(Math.random() * buffers.length);
          buffer = buffers[index];
          gain = type === 'downbeat' ? 1 : 0.5;
          break;
        }
        case 'drumstick':
        case 'old-numerical': {
          buffer = buffers;
          gain = type === 'downbeat' ? 1 : 0.5;
          break;
        }
      }

      const env = this.audioContext.createGain();
      env.connect(this.audioContext.destination);
      env.gain.value = gain;

      const src = this.audioContext.createBufferSource();
      src.connect(env);
      src.buffer = buffer;
      src.start(audioTime);
    }
  }
}

if (customElements.get('soap-metronome-renderer') === undefined) {
  customElements.define('soap-metronome-renderer', SoapMetronomeRenderer);
}

