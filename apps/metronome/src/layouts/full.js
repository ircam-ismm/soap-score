import { html } from 'lit';

import '@ircam/sc-components/sc-clock.js';

import '../components/SoapTransportControl.js';
import '../components/SoapMetronomeRenderer.js';
import '../components/SoapFlashBeatRenderer.js';
import '../components/SoapScoreLocationRenderer.js';
import '../components/SoapStaveRenderer.js';
import '../components/SoapScoreExamples.js';
import '../components/SoapScoreGenerator.js';
import '../components/SoapScoreEditor.js';
import '../components/SoapScoreImport.js';
import '../components/SoapScoreExport.js';

export default function layoutFull(app) {
  return html`

    <div class='timer'>
      <sc-clock
        .getTimeFunction=${() => app.transport.currentPosition}
      ></sc-clock>
    </div>
    <div class='flash'>
      <soap-flash-beat-renderer
        .transport=${app.transport}
        .interpreter=${app.interpreter}
      ></soap-flash-beat-renderer>
    </div>
    <div id="full">
      <div class="transport-control">
        <soap-transport-control
          .global=${app.global}
          .transport=${app.transport}
          .interpreter=${app.interpreter}
          .audioContext=${app.audioContext}
          score=${app.score}
        ></soap-transport-control>
      </div>
    </div>
    <soap-score-location-renderer
      .transport=${app.transport}
      .interpreter=${app.interpreter}
    ></soap-score-location-renderer>
    <br />
    <soap-stave-renderer
      .transport=${app.transport}
      .interpreter=${app.interpreter}
    ></soap-stave-renderer>
    <br >
    <soap-score-editor
      score=${app.score}
      @change=${e => app.setScore(e.detail.value)}
    ></soap-score-editor>
    <br >
    <soap-metronome-renderer
      .transport=${app.transport}
      .interpreter=${app.interpreter}
      .audioContext=${app.audioContext}
      .buffers=${app.buffers}
      .audioOutput=${app.audioContext.destination}
    ></soap-metronome-renderer>
    <br />
    <soap-score-examples
      @change=${e => app.setScore(e.detail.value)}
    ></soap-score-examples>
    <br />
    <soap-score-generator
      @change=${e => app.setScore(e.detail.value)}
    ></soap-score-generator>
    <br />
    <soap-score-import
      @change=${e => app.setScore(e.detail.value)}
    ></soap-score-import>
    <br />
    <soap-score-export
      .score=${app.score}
    ></soap-score-export>
  `;
}
