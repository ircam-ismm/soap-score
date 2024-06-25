import { html, LitElement, nothing, css } from 'lit';
import { TransportEvent } from '@ircam/sc-scheduling';
import { Renderer, Stave, StaveNote, Voice, Formatter, StaveModifier, TextNote } from 'vexflow';

import '@ircam/sc-components/sc-flash.js';

function parseSignature(sig) {
  sig = sig.slice(1, -1); // remove brackets
  const [upper, lower] = sig.split('/'); // split at '/'
  return { upper, lower };
}

function isPowerOfTwo(n) {
  return (Math.log(n)/Math.log(2)) % 1 === 0;
}

function renderSignature(upper, lower) {
  const div = document.createElement('div');

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(100, 50);
  const context = renderer.getContext();
  const stave = new Stave(0, -30, 0);

  stave.addTimeSignature(`${upper}/${lower}`);
  stave.setContext(context).draw();
  context.rect(0, 0, 1, 100, { stroke: 'none', fill: 'white' });

  return div;
}

function renderTempo(upper, lower, bpm) {
  let duration = lower / upper;
  let dots = null;

  if ( Math.floor(duration) === duration ) {
    dots = 0;
  } else {
    duration = lower / (upper - 1);
    dots = 1;
  }

  const div = document.createElement('div');

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(80, 60);
  const context = renderer.getContext();

  const stave = new Stave(-10, 10, 0);

  if (isPowerOfTwo(duration) === false) {
    stave.setText(`/${lower}`, StaveModifier.Position.BELOW, {
      shift_x:20,
      shift_y:-76,
      justification: TextNote.Justification.LEFT
    });
    duration = 1;
  }

  stave.setTempo({ duration, dots, bpm }, 0);
  stave.setContext(context).draw();

  return div;
}

class SoapStaveRenderer extends LitElement {
  static styles = css`
    :host {
      background-color: white;
      display: block;
      width: 100%;
      height: 150px;
      color: black;
      font-size: 24px;
      box-sizing: border-box;
      padding: 10px;
    }
  `;

  constructor() {
    super();

    this.transport = null;
    this.interpreter = null;

    this.signature = null;
    this.tempoBasis = null;
    this.tempoBPM = null;
    this.duration = null;

    this.process = this.process.bind(this);
  }

  render() {
    if (this.duration) {
      return html`<span>Duration: ${this.duration}s<span>`;
    } else if (this.signature) {
      const signature = parseSignature(this.signature);
      const tempoBasis = parseSignature(this.tempoBasis);

      const _$signature = renderSignature(signature.upper, signature.lower);
      const _$tempo = renderTempo(tempoBasis.upper, tempoBasis.lower, this.tempoBPM);

      return html`
        <div>${_$signature}</div>
        <div>${_$tempo}</div>
      `
    } else {
      return nothing;
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

    const signature = infos.event.signature?.value;
    const tempoBasis = infos.event.tempo?.basis.value;
    const tempoBPM = infos.event.tempo?.bpm;
    const duration = infos.event.duration;

    if (this.signature !== signature
      || this.tempoBasis !== tempoBasis
      || this.tempoBPM !== tempoBPM
      || this.duration !== duration
    ) {
      this.signature = signature;
      this.tempoBasis = tempoBasis;
      this.tempoBPM = tempoBPM;
      this.duration = duration;

      setTimeout(() => this.requestUpdate(), tickLookahead * 1000);
    }

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

if (customElements.get('soap-stave-renderer') === undefined) {
  customElements.define('soap-stave-renderer', SoapStaveRenderer);
}

