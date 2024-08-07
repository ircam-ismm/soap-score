import { css, html, LitElement } from 'lit';

class SoapChenillard extends LitElement {
  static get properties() {
    return {
      size: { type: Number }, // handler size
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
        width: 400px;
        height: 30px;
        background-color: rgb(106, 106, 105);
        border: 1px solid rgb(106, 106, 105);
      }

      svg {
        width: 100%;
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

    this.size = 0.1; // size of the moving part
    this.getProgressFunction = null;

    this._progress = 0;
    this._render = this._render.bind(this);
  }

  render() {
    const handlerWidth = 1000 * this.size;
    // progress 0 is on the left
    // progress 1 is on the right
    const posX = Math.round(this._progress * (1000 - handlerWidth));

    return html`
      <svg viewBox="0 0 1000 1000"  preserveAspectRatio="none">
        <rect class="background" width="1000" height="1000"></rect>
        <rect class="foreground" x="${posX}" width="${handlerWidth}" height="1000"></rect>
      </svg>
    `;
  }

  _render() {
    let progress = Math.max(0, Math.min(1, this.getProgressFunction()));

    if (Number.isFinite(progress)) {
      if (progress !== this._progress) {
        this._progress = progress;
        this.requestUpdate();
      }
    }

    this._rafId = requestAnimationFrame(this._render);
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

if (customElements.get('soap-chenillard') === undefined) {
  customElements.define('soap-chenillard', SoapChenillard);
}

