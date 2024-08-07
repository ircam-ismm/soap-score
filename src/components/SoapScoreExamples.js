import { html, LitElement, css } from 'lit';
import * as fixtures from '../utils/fixtures.js';

import '@ircam/sc-components/sc-select.js';
// import '@ircam/sc-components/sc-text.js'

const examples = {};

for (let name in fixtures) {
  if (name.endsWith('Score')) {
    examples[name] = fixtures[name];
  }
}

class SoapScoreExamples extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    sc-select {
      width: 100%;
    }
  `

  constructor() {
    super();
    this.value = null;
  }

  render() {
    return html`
      <sc-select
        .options=${Object.keys(examples)}
        placeholder="select example score"
        @change=${this._onChange}
      ></sc-select>
    `;
  }

  _onChange(e) {
    e.stopPropagation();

    const score = examples[e.detail.value];
    const changeEvent = new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: score },
    });

    this.dispatchEvent(changeEvent);
  }
}

if (customElements.get('soap-score-examples') === undefined) {
  customElements.define('soap-score-examples', SoapScoreExamples);
}
