import { html, LitElement, css } from 'lit';
import midi2soap from '../../../../src/parsers/midi2soap.js';
import augustin2soap from '../../../../src/parsers/augustin2soap.js';

import '@ircam/sc-components/sc-dragndrop.js'
import '@ircam/sc-components/sc-text.js'

class SoapScoreImport extends LitElement {
  static styles = css``;

  render() {
    return html`
      <sc-text>Import</sc-text>
      <sc-dragndrop
        @change=${e => this._parseSoap(e)}
      >drag'n'drop SO(a)P</sc-dragndrop>
      <sc-dragndrop
        @change=${e => this._parseMidi(e)}
      >drag'n'drop MIDI</sc-dragndrop>
      <sc-dragndrop
        @change=${e => this._parseAugustin(e)}
      >drag'n'drop Augustin</sc-dragndrop>
    `;
  }

  _parseSoap(e) {
    e.stopPropagation();

    const name = Object.keys(e.detail.value)[0];
    const score = e.detail.value[name];
    this._triggerChange(score);
  }

  _parseMidi(e) {
    e.stopPropagation();

    const name = Object.keys(e.detail.value)[0];
    const file = e.detail.value[name];
    const score = midi2soap.readString(file, name);
    this._triggerChange(score);
  }

  _parseAugustin(e) {
    e.stopPropagation();

    const name = Object.keys(e.detail.value)[0];
    const file = e.detail.value[name];
    const score = augustin2soap.readString(file, name);
    this._triggerChange(score);
  }

  _triggerChange(score) {
    const changeEvent = new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { value: score },
    });

    this.dispatchEvent(changeEvent);
  }
}

if (customElements.get('soap-score-import') === undefined) {
  customElements.define('soap-score-import', SoapScoreImport);
}
