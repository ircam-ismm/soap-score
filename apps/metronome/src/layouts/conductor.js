import { html, nothing } from 'lit';


import '@ircam/sc-components';

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

import '../../../soap-metronome/src/views/sc-progress-bar.js';  

import { renderTempo, renderTimeSignature } from '../../../soap-metronome/src/views/staves.js';

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