import { html, LitElement, css, nothing } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';

import '@ircam/sc-components/sc-flash.js';

import './utils/soap-chenillard.js';
import './utils/soap-progress-bar.js';

const easing = x => x + (Math.sin(x * Math.PI * 2) / 28);

class SoapProgressBeatRenderer extends LitElement {
  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
    }

    soap-progress-bar,
    soap-chenillard {
      width: 100%;
      height: 100%;
    }
  `;

  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;

    this.infos = null;
    this.isAbsoluteDurationEvent = null;
    this.timeoutId = null;

    this.process = this.process.bind(this);
  }

  render() {
    // not yet inited
    if (this.isAbsoluteDurationEvent === null) {
      return nothing;
    }

    if (this.isAbsoluteDurationEvent) {
      return html`
        <soap-progress-bar
          .getProgressFunction=${() => {
            const currentPosition = this.transport.currentPosition;
            const { position, duration, beat } = this.infos;
            const norm = Math.min(1, Math.max(0, (currentPosition - position) / duration));
            return norm;
          }}
        ></soap-progress-bar>
      `
    } else {
      return html`
        <soap-chenillard
          .getProgressFunction=${() => {
            const currentPosition = this.transport.currentPosition;
            const { position, duration, beat } = this.infos;
            const norm = Math.min(1, Math.max(0, (currentPosition - position) / duration));
            const animated = easing(norm);
            return (beat % 2 === 0) ? 1 - animated : animated;
          }}
        ></soap-chenillard>
      `
    }
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.transport.has(this.process)) {
      this.transport.add(this.process);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.transport.has(this.process)) {
      this.transport.remove(this.process);
    }
  }

  updateFromPosition(position, tickLookahead) {
    const { bar, beat } = this.interpreter.getLocationAtPosition(position);
    const infos = this.interpreter.getLocationInfos(bar, beat);

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      const isAbsoluteDurationEvent = !!infos.event.duration;
      this.infos = infos;

      if (isAbsoluteDurationEvent !== this.isAbsoluteDurationEvent) {
        this.isAbsoluteDurationEvent = isAbsoluteDurationEvent;
        this.requestUpdate();
      }
    }, tickLookahead * 1000);

    return infos;
  }

  // transport callback
  process(position, audioTime, event) {
    if (event instanceof TransportEvent) {
      this.updateFromPosition(position, event.tickLookahead);
      return event.speed > 0 ? position : Infinity;
    }

    const infos = this.updateFromPosition(position, event.tickLookahead);
    return position + infos.dt;
  }
}

if (customElements.get('soap-progress-beat-renderer') === undefined) {
  customElements.define('soap-progress-beat-renderer', SoapProgressBeatRenderer);
}

