import { html, LitElement, css, nothing } from 'lit';
import SoapScoreInterpreter from '../../../../src/SoapScoreInterpreter.js';

import '@ircam/sc-components/sc-editor.js';
import '@ircam/sc-components/sc-button.js';

async function ensureResumedAudioContext(audioContext) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

class SoapScoreEditor extends LitElement {
  static properties = {
    score: { type: String },
  };

  static styles = css`
    :host sc-editor {
      width: 95%;
      height: 95%;
    }
  `;

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
      <sc-button
        @input=${e => {
          const $editor = e.target.nextElementSibling;
          $editor.save();
        }}
      >Save score</sc-button>
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

