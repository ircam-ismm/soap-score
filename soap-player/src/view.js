import { render, html } from 'lit/html.js';
import { live } from 'lit/directives/live.js';
import { TimeSignature } from 'tonal';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

let manualScore = {
  tempo: 60,
  signature: {
    upper: 4,
    lower: 4,
  },
  basis: '1/4',
};

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

  // console.log(soapEngine);
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

function createScore(e) {
  return `BAR 1 [${e.signature.upper}/${e.signature.lower}] TEMPO [${e.basis}]=${e.tempo}`;
}


export function renderScreen(viewState) {
  const {
    transport,
    soapEngine,
    active,
    score,
    scores,
    getTime,
    setScore,
    jumpToLabel,
    transportState,
    seekBarBeat,
    loopState,
  } = viewState;

  render(html`
    <h2>SO(a)P player</h2>

    <h3>affichage</h3>
    <div>
      <div id="bpmBasis"></div>
      <div id="timesignature"></div>
      <div>
        <sc-bang
          .active="${live(active ? soapEngine.beat === 1 : false)}"
        ></sc-bang>
        <sc-bang
          .active="${live(active ? soapEngine.beat !== 1 : false)}"
        ></sc-bang>
      </div>
      <div>
        <sc-clock
          style="margin: 4px 0; display: block;"
          .getTimeFunction=${() => transport.getPositionAtTime(getTime())}
          font-size="20"
          twinkle="[0, 0.5]"
        ></sc-clock>
        <sc-text
          value="${soapEngine.bar}.${soapEngine.beat}"
          readonly
        ></sc-text>
      </div>
      <div>
        <sc-text
          value="labels: ${soapEngine.current && soapEngine.current.event ? soapEngine.current.event.label : ''}"
          readonly
        ></sc-text>
      </div>
    </div>

    <h3>controle</h3>
    <div style="margin: 4px 0;">
      <sc-return
        @input="${e => {
          const now = getTime() + 0.05;

          viewState.seekBarBeat.bar = 1;
          viewState.seekBarBeat.beat = 1;
          transport.seek(now, 0);

        }}"
      ></sc-return>
      <sc-transport
        buttons="[play, pause, stop]"
        state="${viewState.transportState}"
        @change=${e => {
          const now = getTime() + 0.05;

          viewState.transportState = e.detail.value;

          switch (e.detail.value) {
            case 'play': {
              transport.play(now);
              break;
            }
            case 'pause': {
              transport.pause(now);
              viewState.seekBarBeat.bar = soapEngine.bar;
              viewState.seekBarBeat.beat = soapEngine.beat;
              break;
            }
            case 'stop': {
              transport.pause(now);
              const pos = soapEngine.interpreter.getPositionAtLocation(viewState.seekBarBeat.bar, viewState.seekBarBeat.beat);
              transport.seek(now, pos);
              break;
            }
          }
        }}
      ></sc-transport>
      <sc-loop
        @change="${e => transport.loop(getTime(), e.detail.value)}"
      ></sc-loop>
    </div>
    <div style="margin: 4px 0;">
      <sc-text
        value="go to bar.beat"
        readonly
      ></sc-text>
      <sc-number
        min="1"
        value="${viewState.seekBarBeat.bar}"
        @change=${(e) => {
          const now = getTime() + 0.05;
          seekBarBeat.bar = e.detail.value;
          const pos = soapEngine.interpreter.getPositionAtLocation(viewState.seekBarBeat.bar, viewState.seekBarBeat.beat);
          transport.seek(now, pos);
        }}
      ></sc-number>
      <sc-number
        min="1"
        value="${viewState.seekBarBeat.beat}"
        @change=${(e) => {
          const now = getTime() + 0.05;
          seekBarBeat.bar = e.detail.value;
          const pos = soapEngine.interpreter.getPositionAtLocation(viewState.seekBarBeat.bar, viewState.seekBarBeat.beat);
          transport.seek(now, pos);
        }}
      ></sc-number>
    </div>
    <div style="margin: 4px 0;">
      <sc-text
        value="loop"
        readonly
      ></sc-text>
      from
      <sc-number
        min="1"
        value="${viewState.loopState.start.bar}"
        @change="${e => {
          viewState.loopState.start.bar = e.detail.value;
          transport.loopStart = soapEngine.interpreter.getPositionAtLocation(viewState.loopState.start.bar, viewState.loopState.start.beat);
        }}"
      ></sc-number>
      <sc-number
        min="1"
        value="${viewState.loopState.start.beat}"
        @change="${e => {
          viewState.loopState.start.beat = e.detail.value;
          transport.loopStart = soapEngine.interpreter.getPositionAtLocation(viewState.loopState.start.bar, viewState.loopState.start.beat);
        }}"
      ></sc-number>
      to
      <sc-number
        min="1"
        value="${viewState.loopState.end.bar}"
        @change="${e => {
          viewState.loopState.end.bar = e.detail.value;
          transport.loopEnd = soapEngine.interpreter.getPositionAtLocation(viewState.loopState.end.bar, viewState.loopState.end.beat);
        }}"
      ></sc-number>
      <sc-number
        min="1"
        value="${viewState.loopState.end.beat}"
        @change="${e => {
          viewState.loopState.end.beat = e.detail.value;
          transport.loopEnd = soapEngine.interpreter.getPositionAtLocation(viewState.loopState.end.bar, viewState.loopState.end.beat);
        }}"
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
        value="${manualScore.tempo}"
        @change=${e => {
          manualScore.tempo = e.detail.value;
          setScore(createScore(manualScore));
        }}
      ></sc-number>
      <sc-tap-tempo
        @change="${e => {
          manualScore.tempo = e.detail.value.toFixed(2);
          setScore(createScore(manualScore));
        }}"
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
        @change=${e => {
          manualScore.signature.upper = e.detail.value;
          setScore(createScore(manualScore));
        }}
      ></sc-number>/
      <sc-number
        min="0"
        value="4"
        integer
        @change=${e => {
          manualScore.signature.lower = e.detail.value;
          setScore(createScore(manualScore));
        }}
      ></sc-number>
    </div>
    <div style="margin: 4px 0;">
      <sc-text
        value="BPM basis"
        readonly
      ></sc-text>
      <select @change="${(e) => {
        manualScore.basis = e.target.value;
        setScore(createScore(manualScore));
      }}">
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
          value="${score}"
          @change="${e => setScore(e.detail.value)}"
        ></sc-editor>
      </div>
    </div>


    <h3>parameters</h3>
    <div style="margin: 4px 0;">


      <sc-text
          value="mode de sonification"
          readonly
      ></sc-text>
      <form action="#">
            <select name="" id="">
              <option value="bar">bar</option>
              <option value="odd">odd</option>
              <option value="even">even</option>
              <option value="beat">beat</option>
              <option value="double">double</option>
            </select>
      </form>

      <sc-toggle
        ?active=${soapEngine.sonifySubBeats}
        @change=${e => soapEngine.sonifySubBeats = e.detail.value}
      ></sc-toggle>
    </div>

    <h3>tests</h3>
    <div style="margin: 4px 0;">
      <br />
      ${Object.keys(scores).map(name => {
        return html`<sc-button
          style="padding-bottom: 2px;"
          value="${name}"
          @input=${e => setScore(scores[name])}
        ></sc-button>
        `;
      })}

      <sc-text
        style="margin: 4px 0;"
        value="labels"
        readonly
      ></sc-text>
      <br />
      ${soapEngine.interpreter.getLabels().map(name => {
        return html`<sc-button
          style="padding-bottom: 2px;"
          value="${name}"
          @input=${e => jumpToLabel(name)}
        ></sc-button>
        `;
      })}
    </div>


  `, document.body);



  renderTempo(soapEngine);
  renderTimeSignature(soapEngine);

}
