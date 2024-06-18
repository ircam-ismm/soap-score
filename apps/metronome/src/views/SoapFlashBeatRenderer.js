import { html, LitElement } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-flash.js';

class SoapFlashBeatRenderer extends LitElement {
  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;
    this.process = this.process.bind(this);
  }

  render() {
    return html`
      <sc-flash class="downbeat"
        .active=${this.beat === 1 ? this.beat : null}
      ></sc-flash>
      <sc-flash class="upbeat"
        .active=${this.beat !== 1 ? this.beat : null}
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

