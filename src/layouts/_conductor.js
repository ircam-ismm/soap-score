import { html, nothing } from 'lit';


import '@ircam/sc-components';

import '@ircam/soap-score/components/SoapTransportControl.js';
import '@ircam/soap-score/components/SoapMetronomeRenderer.js';
import '@ircam/soap-score/components/SoapFlashBeatRenderer.js';
import '@ircam/soap-score/components/SoapScoreLocationRenderer.js';
import '@ircam/soap-score/components/SoapStaveRenderer.js';
import '@ircam/soap-score/components/SoapScoreExamples.js';
import '@ircam/soap-score/components/SoapScoreGenerator.js';
import '@ircam/soap-score/components/SoapScoreEditor.js';
import '@ircam/soap-score/components/SoapScoreImport.js';
import '@ircam/soap-score/components/SoapScoreExport.js';

// import '../../../soap-metronome/src/views/sc-progress-bar.js';
// import { renderTempo, renderTimeSignature } from '../../../soap-metronome/src/views/staves.js';

let renderDoc = false;
let renderAdvancedOptions = false;
const breakpoint = 960;

export default function layoutFull(app) {

  return html`
    <div id="conductor">
      <div class="row row-1">
        <!-- SCORE TIMING -->
        <sc-clock 
          class="fit"
          twinkle
          format="hh:mm:ss:ms"
          .getTimeFunction=${() => app.transport.currentPosition}
        ></sc-clock>
        <sc-button class="fit"> 
          Name of the part
        </sc-button>
      </div>
      <div class="row row-2">
        <div class="col col-1">
          <soap-stave-renderer
            .transport=${app.transport}
            .interpreter=${app.interpreter}
          ></soap-stave-renderer>
          <sc-button
            class="fit"
            style="width:90%;"
          > Measure N°</sc-button>

          <!--  --------------------------------- PROTOTYPING -------------------------------------------------->          
          <sc-transport

          ></sc-transport>
        </div>
        <div class="col col-2">
          <soap-flash-beat-renderer
            .transport=${app.transport}
            .interpreter=${app.interpreter}
          ></soap-flash-beat-renderer>
        </div>
      </div>
    </div>
  `;
}
