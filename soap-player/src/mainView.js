import { html } from 'lit/html.js';
import { live } from 'lit/directives/live.js';
import { TimeSignature } from 'tonal';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

import '@ircam/simple-components/sc-bang.js';
import '@ircam/simple-components/sc-transport.js';
import '@ircam/simple-components/sc-number.js';
import '@ircam/simple-components/sc-editor.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-tap-tempo.js';
import '@ircam/simple-components/sc-return.js';
import '@ircam/simple-components/sc-loop.js';
import './sc-clock.js';

function renderTempo(soapEngine) {

  if (!soapEngine.current) {
    return null;
  }

  if (!soapEngine.current.event.tempo) {
    const div = document.getElementById('bpmBasis');
    div.innerHTML = ``;
    return null;
  }

  const { basis, bpm } = soapEngine.current.event.tempo;

  let duration = basis.lower / basis.upper;
  let dots = null;

  if ( Math.floor(duration) === duration ) {
    dots = 0;
  } else {
    duration = basis.lower / (basis.upper - 1);
    dots = 1;
  }

  const div = document.getElementById('bpmBasis');
  div.innerHTML = ``;

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(80, 40);
  const context = renderer.getContext();

  const stave = new Stave(-10, 10, 0);

  stave.setTempo({ duration, dots, bpm }, 0);
  stave.setContext(context).draw();
}

function renderTimeSignature(soapEngine) {
  if (!soapEngine.current) {
    return null;
  }

  if (!soapEngine.current.event.tempo) {
    const div = document.getElementById('timesignature');
    div.innerHTML = ``;
    return null;
  }

  const { signature } = soapEngine.current.event;

  const div = document.getElementById('timesignature');
  // const div = document.createElement('div');
  div.innerHTML = ``;

  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(100, 50);
  const context = renderer.getContext();
  const stave = new Stave(0, -30, 0);

  stave.addTimeSignature(signature.name);
  stave.setContext(context).draw();
  context.rect(0, 0, 1, 100, { stroke: 'none', fill: 'white' });

  //return div;
}

export default function mainView(app) {
  return html`
    <h2>SO(a)P player</h2>

    <h3>affichage</h3>
    <div>
      <div id="bpmBasis"></div>
      <div id="timesignature"></div>
      <div>
        <sc-bang
          .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat === 1 : false)}"
        ></sc-bang>
        <sc-bang
          .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat !== 1 : false)}"
        ></sc-bang>
      </div>
      <div>
        <sc-clock
          style="margin: 4px 0; display: block;"
          .getTimeFunction=${app.getTransportTime}
          font-size="20"
          twinkle="[0, 0.5]"
        ></sc-clock>
        <sc-text
          value="${app.soapEngine.bar}|${app.soapEngine.beat}"
          readonly
        ></sc-text>
      </div>
      <div>
        <sc-text
          value="labels: ${app.soapEngine.current && app.soapEngine.current.event ? app.soapEngine.current.event.label : ''}"
          readonly
        ></sc-text>
      </div>
    </div>

    <h3>controle</h3>
    <div style="margin: 4px 0;">
      <sc-transport
        buttons="[play, stop]"
        width="50"
        state="${app.getTransportState()}"
        @change=${e => app.setTransportState(e.detail.value)}
      ></sc-transport>
    </div>
    <div style="margin: 4px 0;">
      <sc-text
        value="start at position"
        readonly
      ></sc-text>
      <sc-return
        @input=${e => app.seekToLocation(1, 1)}
      ></sc-return>
      <sc-number
        min="1"
        value="${app.model.seekLocation.bar}"
        @change=${e => app.seekToLocation(e.detail.value, app.model.seekLocation.beat)}
      ></sc-number>
      <sc-number
        min="1"
        value="${app.model.seekLocation.beat}"
        @change=${e => app.seekToLocation(sapp.model.seekLocation.bar, e.detail.value)}
      ></sc-number>
    </div>
    <div style="margin: 4px 0;">
      <sc-text
        value="loop"
        readonly
      ></sc-text>
      <sc-loop
        @change=${e => app.setTransportLoop(e.detail.value)}
      ></sc-loop>
      <br />
      <sc-text
        value="from"
        readonly
        width="40"
      ></sc-text>
      <sc-number
        min="1"
        value="${app.model.loopState.start.bar}"
        @change=${e => app.setLoopStartLocation(e.detail.value, app.model.loopState.start.beat)}
      ></sc-number>
      <sc-number
        min="1"
        value="${app.model.loopState.start.beat}"
        @change=${e => app.setLoopStartLocation(app.model.loopState.start.bar, e.detail.value)}
      ></sc-number>
      <sc-text
        value="to"
        readonly
        width="40"
      ></sc-text>
      <sc-number
        min="1"
        value="${app.model.loopState.end.bar}"
        @change=${e => app.setLoopEndLocation(e.detail.value, app.model.loopState.end.beat)}
      ></sc-number>
      <sc-number
        min="1"
        value="${app.model.loopState.end.beat}"
        @change=${e => app.setLoopEndLocation(app.model.loopState.end.bar, e.detail.value)}
      ></sc-number>
    </div>


    <h4>basic</h4>
    <div style="margin: 4px 0;">
      <sc-text
        value="set tempo"
        readonly
      ></sc-text>
      <sc-number
        min="0"
        value="${app.model.generatedScore.tempo}"
        @change=${e => app.generateScore('tempo', e.detail.value)}
      ></sc-number>
      <sc-tap-tempo
        @change=${e => app.generateScore('tempo', parseFloat(e.detail.value.toFixed(2)))}
      ></sc-tap-tempo>
    </div>
    <div style="margin: 4px 0;">
      <sc-text
        value="set time signature"
        readonly
      ></sc-text>
      <sc-number
        min="0"
        value="4"
        integer
        @change=${e => app.generateScore('signatureUpper', e.detail.value)}
      ></sc-number>/
      <sc-number
        min="0"
        value="4"
        integer
        @change=${e => app.generateScore('signatureLower', e.detail.value)}
      ></sc-number>
    </div>
    <div style="margin: 4px 0;">
      <sc-text
        value="BPM basis"
        readonly
      ></sc-text>
      <select
        @change=${e => app.generateScore('basis', e.target.value)}
      >
        <option value="1/4">♩</option>
        <option value="1/8">♪</option>
        <option value="1/2">blanche</option>
        <option value="3/8">♩.</option>
        <option value="3/16">♪.</option>
        <option value="3/4">blanche pointée</option>
      </select>
    </div>

    <div>
      <h4>editor</h4>
      <div style="margin: 4px 0;">
        <sc-editor
          value="${app.model.score}"
          @change=${e => app.setScore(e.detail.value)}
        ></sc-editor>
      </div>
    </div>


    <h3>parameters</h3>
    <div style="margin: 4px 0;">
      <sc-text
        value="mode de sonification"
        readonly
      ></sc-text>
      <select @change=${(e) => app.setSonificationMode(e.target.value)}>
        <option value="auto">auto</option>
        <option value="beat">beat</option>
        <option value="double">double</option>
        <option value="bar">bar</option>
        <option value="odd">odd</option>
        <option value="even">even</option>
      </select>
    </div>

    <h3>tests</h3>
    <div style="margin: 4px 0;">
      <br />
      ${Object.keys(app.model.scoreList).map(name => {
        return html`<sc-button
          style="padding-bottom: 2px;"
          value="${name}"
          @input=${e => app.setScore(app.model.scoreList[name])}
        ></sc-button>
        `;
      })}

      <sc-text
        style="margin: 4px 0;"
        value="labels"
        readonly
      ></sc-text>
      <br />
      ${app.soapEngine.interpreter.getLabels().map(name => {
        return html`<sc-button
          style="padding-bottom: 2px;"
          value="${name}"
          @input=${e => jumpToLabel(name)}
        ></sc-button>
        `;
      })}
    </div>
  `;

  // renderTempo(soapEngine);
  // renderTimeSignature(soapEngine);
}