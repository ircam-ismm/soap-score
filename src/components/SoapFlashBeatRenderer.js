import { html, LitElement, css } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-flash.js';

class SoapFlashBeatRenderer extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      flex-direction: column;
    }

    sc-flash {
      width: 100%;
      flex: 1;
    }
  `;

  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;
    this.beat = null;
    this.process = this.process.bind(this);
  }

  render() {
    // use Math.random() as a hack to trigger the flashes even if we have two
    // consecutive beats with same value, e.g. 2 bars with absolute duration
    return html`
      <sc-flash class="downbeat"
        style ="--sc-flash-active: var(--sc-color-secondary-3);"
        .active=${this.beat !== null && this.beat === 1 ? Math.random() : null}
      ></sc-flash>
      <sc-flash class="upbeat"
        style ="--sc-flash-active: var(--sc-color-secondary-1);"
        .active=${this.beat !== null && this.beat !== 1 ? Math.random() : null}
      ></sc-flash>
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

    if (Math.floor(beat) === beat) {
      this.beat = beat;

      setTimeout(() => {
        this.requestUpdate();
      }, event.tickLookahead * 1000);
    }

    return position + infos.dt;
  }
}

if (customElements.get('soap-flash-beat-renderer') === undefined) {
  customElements.define('soap-flash-beat-renderer', SoapFlashBeatRenderer);
}

