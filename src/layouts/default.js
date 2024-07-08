import { html, nothing } from 'lit';

import '@ircam/sc-components/sc-clock.js';

import '@ircam/soap-score/components/SoapTransportControl.js';
import '@ircam/soap-score/components/SoapMetronomeRenderer.js';
import '@ircam/soap-score/components/SoapFlashBeatRenderer.js';
import '@ircam/soap-score/components/SoapProgressBeatRenderer.js';
import '@ircam/soap-score/components/SoapScoreLocationRenderer.js';
import '@ircam/soap-score/components/SoapStaveRenderer.js';
import '@ircam/soap-score/components/SoapScoreExamples.js';
import '@ircam/soap-score/components/SoapScoreGenerator.js';
import '@ircam/soap-score/components/SoapScoreEditor.js';
import '@ircam/soap-score/components/SoapScoreImport.js';
import '@ircam/soap-score/components/SoapScoreExport.js';

export default function layoutFull(app) {
  return html`
    <div id="full">
      <div class="row-1">
        <div class="col-1">
          <div>
            <soap-stave-renderer
              .transport=${app.transport}
              .interpreter=${app.interpreter}
            ></soap-stave-renderer>
            <soap-flash-beat-renderer
              .transport=${app.transport}
              .interpreter=${app.interpreter}
            ></soap-flash-beat-renderer>
          </div>
          <soap-progress-beat-renderer
            .transport=${app.transport}
            .interpreter=${app.interpreter}
          ></soap-progress-beat-renderer>
        </div>
        <div class="col-2">
          <sc-clock
            .getTimeFunction=${() => app.transport.currentPosition}
          ></sc-clock>
          <soap-score-location-renderer
            .transport=${app.transport}
            .interpreter=${app.interpreter}
          ></soap-score-location-renderer>
        </div>
      </div>
      <div class ="row-2">
        <div class="col-1">
          <soap-score-generator
            @change=${e => app.setScore(e.detail.value)}
          ></soap-score-generator>
          <soap-transport-control
            .global=${app.global}
            .transport=${app.transport}
            .interpreter=${app.interpreter}
            .audioContext=${app.audioContext}
            score=${app.score}
          ></soap-transport-control>
          <soap-metronome-renderer
            .transport=${app.transport}
            .interpreter=${app.interpreter}
            .audioContext=${app.audioContext}
            .buffers=${app.buffers}
            .audioOutput=${app.audioContext.destination}
            sonification=${app.sonification}
            sonificationMode=${app.sonificationMode}
            @change=${e => app.updateSonification(e.detail.key, e.detail.value)}
          ></soap-metronome-renderer>
          <soap-score-export
            .score=${app.score}
            .interpreter=${app.interpreter}
            .buffers=${app.buffers}
            sonification=${app.sonification}
            sonificationMode=${app.sonificationMode}
          ></soap-score-export>
        </div>
        <soap-score-editor class="col-2"
          score=${app.score}
          @change=${e => app.setScore(e.detail.value)}
        ></soap-score-editor>
      </div>

      ${app.renderAdvancedOptions
        ? html`
          <div class="advanced-options">
            <soap-score-examples
              @change=${e => app.setScore(e.detail.value)}
            ></soap-score-examples>
            <soap-score-import
              @change=${e => app.setScore(e.detail.value)}
            ></soap-score-import>
          </div>`
        : nothing
      }
    </div>
  `;
}
