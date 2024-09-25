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

class SoapTransportControl extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      padding: 20px;
    }

    div {
      margin-bottom: 4px;
    }

    .block {
      display: inline-block;
    }

    .loop {
      margin: 20px 0;
    }

    sc-transport {
      height: 80px;
      margin-top: 12px;
      margin-bottom: 24px;
    }

    sc-text {
      width: 140px;
    }

    sc-select {
      width: 164px;
    }

    sc-text.small {
      width: 72px;
      text-align: right;
    }

    sc-number {
      width: 66px;
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
    this.seekBar = 1;
    this.seekBeat = 1;
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
        <sc-text>Jump to position</sc-text>
        <div class="block">
          <sc-prev
            @input=${e => this.transport.seek(0)}
          ></sc-prev>
          <sc-number
            min="1"
            integer
            value=${this.seekBar}
            @change=${e => {
              this.seekBar = e.detail.value;
              const position = this.interpreter.getPositionAtLocation(this.seekBar, this.seekBeat);
              this.transport.seek(position);
            }}
          ></sc-number>
          <sc-number
            min="1"
            integer
            value=${this.seekBeat}
            @change=${e => {
              this.seekBeat = e.detail.value;
              const position = this.interpreter.getPositionAtLocation(this.seekBar, this.seekBeat);
              this.transport.seek(position);
            }}
          ></sc-number>
        </div>
      </div>
      <div class="loop">
        <div>
          <sc-text>Loop</sc-text>
          <sc-loop
            ?value=${this.loop}
            @change=${e => {
              this.loop = e.detail.value
              this.transport.loop(this.loop);
            }}
          ></sc-loop>
        </div>
        <div>
          <sc-text class="small">from</sc-text>
          <div class="block">
            <sc-number
              min="1"
              integer
              value=${this.loopStartBar}
              @change=${e => {
                this.loopStartBar = e.detail.value;
                const position = this.interpreter.getPositionAtLocation(this.loopStartBar, this.loopStartBeat);
                this.transport.loopStart(position);
              }}
            ></sc-number>
            <sc-number
              min="1"
              integer
              value=${this.loopStartBeat}
              @change=${e => {
                this.loopStartBeat = e.detail.value;
                const position = this.interpreter.getPositionAtLocation(this.loopStartBar, this.loopStartBeat);
                this.transport.loopStart(position);
              }}
            ></sc-number>
          </div>
        </div>
        <div>
          <sc-text class="small">to</sc-text>
          <div class="block">
            <sc-number
              min="1"
              integer
              value=${this.loopEndBar}
              @change=${e => {
                this.loopEndBar = e.detail.value;
                const position = this.interpreter.getPositionAtLocation(this.loopEndBar, this.loopEndBeat);
                this.transport.loopEnd(position);
              }}
            ></sc-number>
            <sc-number
              min="1"
              integer
              value=${this.loopEndBeat}
              @change=${e => {
                this.loopEndBeat = e.detail.value;
                const position = this.interpreter.getPositionAtLocation(this.loopEndBar, this.loopEndBeat);
                this.transport.loopEnd(position);
              }}
            ></sc-number>
          </div>
        </div>
      </div>
      <div>
        <sc-text>Speed</sc-text>
        <sc-number
          min="0.1"
          max="5"
          value=${this.speed}
          @change=${e => {
            this.speed = e.detail.value;
            this.transport.speed(this.speed);
          }}
        ></sc-number>
      </div>
      ${labels.length > 0 ?
        html`
          <div>
            <sc-text>Go to label</sc-text>
            <sc-select
              placeholder="select label"
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

  process(position, audioTime, event) {
    if (event instanceof TransportEvent) {
      if (['start', 'pause', 'stop'].includes(event.type)) {
        this.state = event.type;
        setTimeout(() => this.requestUpdate(), event.tickLookahead * 1000);
      }

      return event.speed > 0 ? position : Infinity;
    }
  }
}

if (customElements.get('soap-transport-control') === undefined) {
  customElements.define('soap-transport-control', SoapTransportControl);
}
