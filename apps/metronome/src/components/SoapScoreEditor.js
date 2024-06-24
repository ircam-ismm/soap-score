import { html, LitElement, nothing } from 'lit';
import SoapScoreInterpreter from '../../../../src/SoapScoreInterpreter.js';

import '@ircam/sc-components/sc-editor.js';

async function ensureResumedAudioContext(audioContext) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

class SoapScoreEditor extends LitElement {
  static properties = {
    score: { type: String },
  };

  constructor() {
    super();

    this.score = '';
    this.err = null;
  }

  render() {
    return html`
      <sc-editor
        save-button
        value=${this.score}
        @change=${this._onScoreChange}
      ></sc-editor>
      ${this.err
        ? html`<p>${this.err.message}</p>`
        : nothing
      }
    `;
  }

  async _onScoreChange(e) {
    e.stopPropagation();

    const score = e.detail.value;

    try {
      new SoapScoreInterpreter(score);
      this.err = null;
    } catch (err) {
      this.err = err;
    }

    this.requestUpdate();

    const changeEvent = new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: score },
    });

    this.dispatchEvent(changeEvent);
  }
}

if (customElements.get('soap-score-editor') === undefined) {
  customElements.define('soap-score-editor', SoapScoreEditor);
}

