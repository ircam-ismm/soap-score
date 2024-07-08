import { css, html, svg, nothing, LitElement } from 'lit';;
import { getTime } from '@ircam/sc-gettime';

class SoapProgressBar extends LitElement {
  static get properties() {
    return {
      getProgressFunction: {},
      duration: { type: Number },
    }
  }
  static get styles() {
    return css`
      :host {
        vertical-align: top;
        display: inline-block;
        box-sizing: border-box;
        vertical-align: top;
        font-size: 0;
        background-color: rgb(106, 106, 105);
        border: 1px solid rgb(106, 106, 105);
        width: 300px;
        height: 30px;
      }

      sc-number {
        width: 120px;
        height: 100%;
      }

      svg {
        width: calc(100% - 120px);
        height: 100%;
      }

      rect.foreground {
        fill: var(--sc-color-secondary-2);
      }

      rect.background {
        fill: var(--sc-color-primary-1);
      }
    `;
  }

  constructor() {
    super();

    this.getProgressFunction = getTime;
    this.duration = 1;

    this._value = 0;
    this._norm = 0;
  }

  render() {
    return html`
      <sc-number
        readonly
        min="0"
        step="0.1"
        value="${this._value}"
      ></sc-number>
      <svg viewBox="0 0 1000 1000"  preserveAspectRatio="none">
        <rect class="background" width="1000" height="1000"></rect>
        <rect class="foreground" width="${Math.max(0, Math.round(this._norm * 1000))}" height="1000"></rect>
      </svg>
    `;
  }

  _render() {
    const progress = this.getProgressFunction(); // normalized

    if (progress !== this._norm) {
      this._norm = progress;
      this._value = progress * this.duration;;
      this.requestUpdate();
    }

    this._rafId = requestAnimationFrame(() => this._render());
  }

  connectedCallback() {
    super.connectedCallback();
    this._render();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._timeoutInterval);
    super.disconnectedCallback();
  }

}

if (customElements.get('soap-progress-bar') === undefined) {
  customElements.define('soap-progress-bar', SoapProgressBar);
}

