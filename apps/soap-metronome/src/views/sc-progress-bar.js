import { css, html, svg, nothing, LitElement } from 'lit';;
import { getTime } from '@ircam/sc-gettime';

class ScProgressBar extends LitElement {
  static get properties() {
    return {
      getProgressFunction: {},
      min: { type: Number },
      max: { type: Number },
      displayNumber: { type: Boolean },
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
    this.width = 400;
    this.height = 30;
    this.min = 0;
    this.max = 1;
    this.displayNumber = false;

    this._clamped = 0;
    this._norm = 0;
  }

  render() {
    const progressWidth = Math.round(this._norm * 1000);

    return html`
      <sc-number
        readonly
        min="0"
        value="${this._clamped}"
      ></sc-number>
      <svg viewBox="0 0 1000 1000"  preserveAspectRatio="none">
        <rect class="background" width="1000" height="1000"></rect>
        <rect class="foreground" width="${progressWidth}" height="1000"></rect>
      </svg>
    `;
  }

  _render() {
    const progress = this.getProgressFunction();

    if (Number.isFinite(progress)) {
      const clamped = Math.min(Math.max(progress, this.min), this.max);

      let norm = 0;

      if (Number.isFinite(clamped)) {
        norm = (clamped - this.min) / (this.max - this.min);
      };

      if (norm !== this._norm) {
        this._clamped = clamped;
        this._norm = norm;
        this.requestUpdate();
      }
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

if (customElements.get('sc-progress-bar') === undefined) {
  customElements.define('sc-progress-bar', ScProgressBar);
}

