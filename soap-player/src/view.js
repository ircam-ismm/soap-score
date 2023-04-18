import { render, html } from 'lit/html.js';
import { TimeSignature } from 'tonal';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

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
  renderer.resize(100, 40);
  const context = renderer.getContext();
  const stave = new Stave(0, 10, 0);

  stave.setTempo({ duration, dots, bpm }, 0);
  stave.setContext(context).draw();
}

// function renderTimeSignature(soapEngine) {
//   if (!soapEngine.current) {
//     return null;
//   }



//   if (!soapEngine.current.event.tempo) {
//     const div = document.getElementById('timesignature');
//     div.innerHTML = ``;
//     return null;
//   }

//   console.log(soapEngine);
//   // const { basis, bpm } = soapEngine.current.event;

//   const div = document.getElementById('timesignature');
//   div.innerHTML = ``;

//   const renderer = new Renderer(div, Renderer.Backends.SVG);
//   renderer.resize(100, 40);
//   const context = renderer.getContext();
//   const stave = new Stave(0, 10, 0);
//   stave.setTempo({ duration, dots, bpm }, 0);
//   stave.setContext(context).draw();
// }

export function renderScreen(viewState) {
  const { transport, soapEngine, active, score, scores, getTime, setScore, jumpToLabel } = viewState;

  render(html`
    <h2>SO(a)P player</h2>
    <div class="metronome">
      <div id="bpmBasis"></div>
    <sc-transport
      buttons="[play, pause, stop]"
      state="stop"
      @change=${e => {
        const now = getTime();

        switch (e.detail.value) {
          case 'play': {
            transport.play(now);
            break;
          }
          case 'pause': {
            transport.pause(now);
            break;
          }
          case 'stop': {
            transport.pause(now);
            transport.seek(now, 0);
            break;
          }
        }
      }}
    ></sc-transport>

    <sc-clock
      style="margin: 4px 0; display: block;"
      .getTimeFunction=${() => transport.getPositionAtTime(getTime())}
      font-size="20"
      twinkle="[0, 0.5]"
    ></sc-clock>

    <div style="margin: 4px 0;">
      <sc-number
        integer
        min="0"
        max="1000"
        value="${soapEngine.bar}"
      ></sc-number>
      <sc-number
        integer
        min="0"
        max="1000"
        value="${soapEngine.beat}"
      ></sc-number>
      <sc-bang
        ?active="${active}"
      ></sc-bang>
    </div>

    <div>
      <sc-text
        value="labels:"
        readonly
      ></sc-text>
      <sc-text
        value="${soapEngine.current && soapEngine.current.event ? soapEngine.current.event.label : ''}"
        readonly
      ></sc-text>
    </div>

    <div style="margin: 4px 0;">
      <sc-text
        value="sonify sub-beats"
        readonly
      ></sc-text>
      <sc-toggle
        ?active=${soapEngine.sonifySubBeats}
        @change=${e => soapEngine.sonifySubBeats = e.detail.value}
      ></sc-toggle>
    </div>

    <div style="margin: 4px 0;">
      <sc-editor
        value="${score}"
        @change="${e => setScore(e.detail.value)}"
      ></sc-editor>
    </div>

    <div style="margin: 4px 0;">
      <sc-text
        style="margin: 4px 0;"
        value="test scores"
        readonly
      ></sc-text>
      <br />
      ${Object.keys(scores).map(name => {
        return html`<sc-button
          style="padding-bottom: 2px;"
          value="${name}"
          @input=${e => setScore(scores[name])}
        ></sc-button>
        `;
      })}
    </div>

    <div style="margin: 4px 0;">
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

<!--     <sc-slider
      width="800"
      height="100"
      min="0"
      max="1"
      value="0"
    ></sc-slider>
 -->
  `, document.body);


  // console.log(getBpmBasis(soapEngine));
  renderTempo(soapEngine);
}
