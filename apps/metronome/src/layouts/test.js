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

export default function layoutTest(app) {
  return html`
    <sc-clock
      .getTimeFunction=${() => app.transport.currentPosition}
    ></sc-clock>
    <br />
    <soap-transport-control
      .global=${app.global}
      .transport=${app.transport}
      .interpreter=${app.interpreter}
      .audioContext=${app.audioContext}
      score=${app.score}
    ></soap-transport-control>

    <br />
    <soap-flash-beat-renderer
      .transport=${app.transport}
      .interpreter=${app.interpreter}
    ></soap-flash-beat-renderer>
  `;
}

