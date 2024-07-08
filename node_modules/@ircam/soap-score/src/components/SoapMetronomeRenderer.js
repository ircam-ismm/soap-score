import { html, LitElement, css } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-select.js';
import '@ircam/sc-components/sc-text.js';

import MetronomeRenderer from './utils/MetronomeRenderer';

class SoapMetronomeRenderer extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      box-sizing: border-box;
      padding: 20px;
    }

    :host div {
      margin-bottom: 4px;
    }

    sc-text {
      width: 140px;
    }

    sc-select {
      width: 164px;
    }
  `

  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;
    this.buffers = null;
    this.audioContext = null;
    this.audioOutput = null;
    this.process = this.process.bind(this);

    this.fermata = null;
    this.fermataPreBeatSources = [];

    // 'sine', 'drum', 'old-numerical', 'mechanical', 'drumstick'
    this.sonification = null;
    // 'auto', 'double', 'beat', 'bar', 'odd', 'even'
    this.sonificationMode = null;
  }

  render() {
    const soundbanks = Object.keys(this.buffers);
    soundbanks.unshift('sine');

    // use Math.random() as a hack to trigger the flashes even if we have two
    // consecutive beats with same value, e.g. 2 bars with absolute duration
    return html`
      <div>
        <sc-text>Sonification style</sc-text>
        <sc-select
          .options=${soundbanks}
          value=${this.sonification}
          @change=${e => this._triggerChange(e, 'sonification', e.detail.value)}
        ></sc-select>
      </div>
      <div>
        <sc-text>Sound</sc-text>
        <sc-select
          .options=${['auto', 'double', 'beat', 'bar', 'odd', 'even']}
          value=${this.sonificationMode}
          @change=${e => this._triggerChange(e, 'sonificationMode', e.detail.value)}
        ></sc-select>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.renderer = new MetronomeRenderer(this.audioContext, this.audioOutput, this.buffers)

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
      this.renderer.renderBeat(beat, infos, audioTime);
    }

    // handle fermata
    if (infos.event.fermata && infos.event.fermata !== this.fermata) {
      this.fermata = infos.event.fermata;
      // current beat as been played, pause transport at logical end of the
      // fermata unit value, start it back in dt
      const currentTime = this.transport.currentTime;
      const nextPosition = position + infos.duration;

      this.transport.pause(currentTime + infos.duration);

      // handle different fermatas
      if (!this.fermata.suspended) {
        this.transport.seek(nextPosition, currentTime + infos.dt);
        this.transport.start(currentTime + infos.dt);
        // schedule 2 beats before restart to warn / help with restart
        const firstPreBeatTime = currentTime + infos.dt - infos.duration * 2;
        const secondPreBeatTime = currentTime + infos.dt - infos.duration;

        this.fermataPreBeatSources = [];
        this.fermataPreBeatSources[0] = this.renderer.triggerBeat(firstPreBeatTime, 'subbeat');
        this.fermataPreBeatSources[1] = this.renderer.triggerBeat(secondPreBeatTime, 'subbeat');
      } else {
        // just seek to next location and wait for a user event
        this.transport.seek(nextPosition, currentTime + infos.duration);
      }

      return Infinity;
    } else {
      this.fermata = null;
    }

    return position + infos.dt;
  }

  _triggerChange(e, key, value) {
    e.stopPropagation();

    this.renderer[key] = value;

    const changeEvent = new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { key, value },
    });

    this.dispatchEvent(changeEvent);
  }
}

if (customElements.get('soap-metronome-renderer') === undefined) {
  customElements.define('soap-metronome-renderer', SoapMetronomeRenderer);
}

