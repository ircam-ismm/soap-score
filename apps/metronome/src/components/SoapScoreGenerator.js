import { html, LitElement, nothing, css } from 'lit';

import '@ircam/sc-components/sc-select.js';
import '@ircam/sc-components/sc-tap-tempo.js';
// import '@ircam/sc-components/sc-text.js'

class SoapScoreGenerator extends LitElement {
  static styles = css`
    :host {
      background-color: red;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    :host > div {
      margin: 4px;
    }
  `;

  constructor() {
    super();

    this.signatureUpper = 4;
    this.signatureLower = 4;
    this.basis = '1/4';
    this.tempo = 60;
  }

  render() {
    return html`
      <div>
        <sc-text>Time signature</sc-text>
        <sc-number
          min="0"
          value=${this.signatureUpper}
          integer
          @change=${e => {
            e.stopPropagation();
            this._generateScore('signatureUpper', e.detail.value);
          }}
        ></sc-number>
        <sc-text style="width: 20px">/</sc-text>
        <sc-number
          min="0"
          value=${this.signatureLower}
          integer
          @change=${e => {
            e.stopPropagation();
            this._generateScore('signatureLower', e.detail.value);
          }}
        ></sc-number>
      </div>
      <div>
        <sc-text>Tempo</sc-text>
        <sc-number
          min="1"
          value=${this.tempo}
          @change=${e => {
            e.stopPropagation();
            this._generateScore('tempo', e.detail.value);
          }}
        ></sc-number>
        <sc-tap-tempo
          @change=${e => {
            e.stopPropagation();
            this._generateScore('tempo', parseFloat(e.detail.value.toFixed(2)));
          }}
        ></sc-tap-tempo>
      </div>
      <div>
        <sc-text>BPM basis</sc-text>
        <sc-select
          value=${this.basis}
          .options=${['1/4', '1/8', '1/2', '3/8', '3/16', '3/4']}
          @change=${e => this._generateScore('basis', e.target.value)}
        ></sc-select>
      </div>
    `;
  }

  _generateScore(key, value) {
    this[key] = value;

    const { signatureUpper, signatureLower, basis, tempo } = this;
    const score = `BAR 1 [${signatureUpper}/${signatureLower}] TEMPO [${basis}]=${tempo}`;

    const changeEvent = new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: score },
    });

    this.dispatchEvent(changeEvent);
  }
}

if (customElements.get('soap-score-generator') === undefined) {
  customElements.define('soap-score-generator', SoapScoreGenerator);
}

