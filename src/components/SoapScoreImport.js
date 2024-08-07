import { html, LitElement, css } from 'lit';

import '@ircam/sc-components/sc-dragndrop.js';
import '@ircam/sc-components/sc-text.js';

import midi2soap from '../parsers/midi2soap.js';
import augustin2soap from '../parsers/augustin2soap.js';

class SoapScoreImport extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px 0 0 0;
    }

    sc-dragndrop {
      margin: 0 4px 4px 0;
      width: 100%;
    }
  `;

  render() {
    return html`
      <sc-text>Import score</sc-text>
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
