
import { html, css, LitElement } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-flash.js';

class SoapScoreLocationRenderer extends LitElement {
  static styles = css`
    :host {
      font-size: 20px;
    }
  `;

  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;
    this.process = this.process.bind(this);
  }

  render() {
    return html`
      <p>${this.bar}|${this.beat}</p>
      <p>${this.label}</p>
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

  updateFromPosition(position, tickLookahead) {
    const { bar, beat } = this.interpreter.getLocationAtPosition(position);
    const infos = this.interpreter.getLocationInfos(bar, beat);

    this.bar = bar;
    this.beat = Math.floor(beat);
    this.label = infos.event.label;
    setTimeout(() => this.requestUpdate(), tickLookahead * 1000);

    return infos;
  }

  // transport callback
  process(position, audioTime, event) {
    if (event instanceof TransportEvent) {
      this.updateFromPosition(position, event.tickLookahead);
      return event.speed > 0 ? position : Infinity;
    }

    const infos = this.updateFromPosition(position, event.tickLookahead);
    return position + infos.dt;
  }
}

if (customElements.get('soap-score-location-renderer') === undefined) {
  customElements.define('soap-score-location-renderer', SoapScoreLocationRenderer);
}


