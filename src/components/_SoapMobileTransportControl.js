import { html, LitElement, css, nothing } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-transport.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-number.js';
import '@ircam/sc-components/sc-prev.js';
import '@ircam/sc-components/sc-loop.js';

async function ensureResumedAudioContext(audioContext) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

class SoapMobileTransportControl extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      padding: 10px;
      background-color: yellow;
    }

    :host > div {
      margin-bottom: 4px;
    }

    :host sc-transport {
      height: 14vh;
      margin-bottom: 12px;
    }

    :host  .block {
      display: inline-block;
    }
  `;

  static properties = {
    score: { type: String },
  }

  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;
    this.audioContext = null;

    this.state = 'stop';
    this.speed = 1;
    this.seek = 1;
    this.loopStartBar = 1;
    this.loopStartBeat = 1;
    this.loopEndBar = 1;
    this.loopEndBeat = 1;
    this.loop = false;

    this.process = this.process.bind(this);
  }

  render() {
    const labels = this.interpreter.getLabels();

    return html`
      <sc-transport
        .buttons=${['start', 'pause', 'stop']}
        value=${this.state}
        @change=${async e => {
          await ensureResumedAudioContext(this.audioContext);
          this.transport[e.detail.value]();
        }}
      ></sc-transport>
      <div>
        <sc-text style="width: 40%; font-size: 20px;">start at</sc-text>
        <sc-prev
          @input=${e => this.transport.seek(0)}
        ></sc-prev>
        <sc-number
          min="1"
          value=${this.seek}
          @change=${e => {
            this.seek = e.detail.value;
            this.seekBar = Math.floor(this.seek);
            const position = this.interpreter.getPositionAtLocation(this.seekBar, 1);
            this.transport.seek(position);
          }}
        ></sc-number>
      </div>
      </div>
      <div>
      </div>
      ${labels.length > 0 ?
        html`
          <div>
            <sc-select
              placeholder="go to label"
              .options=${labels}
              @change=${e => {
                const position = this.interpreter.getPositionAtLabel(e.detail.value);
                this.transport.seek(position);
              }}
            ></sc-select>
          </div>
        ` : nothing
      }
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
      console.log(event);
      if (['start', 'pause', 'stop'].includes(event.type)) {
        this.state = event.type;
        setTimeout(() => this.requestUpdate(), event.tickLookahead * 1000);
      }

      return event.speed > 0 ? position : Infinity;
    }
  }
}

if (customElements.get('soap-mobile-transport-control') === undefined) {
  customElements.define('soap-mobile-transport-control', SoapMobileTransportControl);
}
