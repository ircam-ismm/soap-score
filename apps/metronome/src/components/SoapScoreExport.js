import { html, LitElement, css, nothing } from 'lit';
import soap2asco from '../../../../src/parsers/soap2asco.js';

import '@ircam/sc-components/sc-icon.js'
import '@ircam/sc-components/sc-text.js'

class SoapScoreExport extends LitElement {
  static styles = css``;

  static properties = {
    score: { type: String },
  };

  constructor() {
    super();

    this.score = null;
  }

  render() {
    return html`
      <sc-text>Export</sc-text>
      <sc-icon
        type="save"
        title="save soap score to disk"
        @input=${this._saveToDisk}
      ></sc-icon>
      <sc-icon
        type="network"
        title="share link"
        @input=${this._shareLink}
      ></sc-icon>
      <!-- cf. https://www.svgrepo.com/svg/350375/location-arrow-up -->
      <sc-icon
        type="network"
        title="export to .asco"
        @input=${this._exportToAsco}
      >
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1792 1792" xml:space="preserve">
          <path d="M187.8,1659L896,200.9L1604.2,1659L896,1285.5L187.8,1659z"/>
        </svg>
      </sc-icon>
      <sc-icon
        type="speaker"
        title="export to audio file"
        @input=${this._exportToAudio}
      ></sc-icon>

      ${this.err ? html`<p>${this.err.message}</p>` : nothing}
    `;
  }

  _saveToDisk() {
    this.err = null;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.score));
    element.setAttribute('download', 'score.soap');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();

    document.body.removeChild(element);
  }

  _shareLink() {
    this.err = null;

    const { origin, pathname } = window.location;
    let url = `${origin}${pathname}`;
    const encoded = encodeURIComponent(this.score);
    url += `?score=${encoded}`;

    navigator.clipboard.writeText(url);
  }

  _exportToAsco() {
    let asco;
    try {
      asco = soap2asco.parse(this.score);
      this.err = null;
    } catch (err) {
      this.err = err;
      this.requestUpdate();
      return;
    }
    // console.log(asco);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(asco));
    element.setAttribute('download', 'score.asco');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  _exportToAudio() {
    console.warn('not implemented, do sonification mode before and share synthesis')
  }
}

if (customElements.get('soap-score-export') === undefined) {
  customElements.define('soap-score-export', SoapScoreExport);
}
