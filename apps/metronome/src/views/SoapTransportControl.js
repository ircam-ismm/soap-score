import { html, LitElement } from 'lit';

import '@ircam/sc-components/sc-transport.js';

async function ensureResumedAudioContext(audioContext) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

class SoapTransportControl extends LitElement {
  constructor() {
    super();

    this.audioContext = null;
    this.transport = null;
  }

  render() {
    return html`
      <sc-transport
        .buttons=${['start', 'pause', 'stop']}
        value='stop'
        @change=${this._onTransportChange}
      ></sc-transport>
    `;
  }

  async _onTransportChange(e) {
    await ensureResumedAudioContext(this.audioContext);
    // console.log(this.audioContext.state);

    const now = this.transport.currentTime;
    const event = this.transport[e.detail.value](now);
  }
}

if (customElements.get('soap-transport-control') === undefined) {
  customElements.define('soap-transport-control', SoapTransportControl);
}
