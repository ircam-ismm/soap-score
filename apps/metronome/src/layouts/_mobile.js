import { html } from 'lit';

import '@ircam/sc-components/sc-clock.js';

// import '@ircam/soap-score/components/SoapMobileTransportControl.js';
import '@ircam/soap-score/components/SoapMetronomeRenderer.js';
import '@ircam/soap-score/components/SoapFlashBeatRenderer.js';
import '@ircam/soap-score/components/SoapScoreLocationRenderer.js';
import '@ircam/soap-score/components/SoapStaveRenderer.js';
import '@ircam/soap-score/components/SoapScoreExamples.js';
import '@ircam/soap-score/components/SoapScoreGenerator.js';
import '@ircam/soap-score/components/SoapScoreEditor.js';
import '@ircam/soap-score/components/SoapScoreImport.js';
import '@ircam/soap-score/components/SoapScoreExport.js';

export default function layoutFull(app) {
  return html`
    <meta name="viewport" content="width=device-width, user-scalable=no" />
    <soap-score-generator
      @change=${e => app.setScore(e.detail.value)}
    ></soap-score-generator>
    <soap-flash-beat-renderer
      .transport=${app.transport}
      .interpreter=${app.interpreter}
    ></soap-flash-beat-renderer>
    <sc-clock
      .getTimeFunction=${() => app.transport.currentPosition}
    ></sc-clock>
    <soap-score-location-renderer
      .transport=${app.transport}
      .interpreter=${app.interpreter}
    ></soap-score-location-renderer>
    <soap-mobile-transport-control
      .global=${app.global}
      .transport=${app.transport}
      .interpreter=${app.interpreter}
      .audioContext=${app.audioContext}
      score=${app.score}
    ></soap-mobile-transport-control>
    <br />
    <br >
    <soap-metronome-renderer
      .transport=${app.transport}
      .interpreter=${app.interpreter}
      .audioContext=${app.audioContext}
      .buffers=${app.buffers}
      .audioOutput=${app.audioContext.destination}
    ></soap-metronome-renderer>
    <br />
    <br />
    <soap-score-export
      .score=${app.score}
    ></soap-score-export>
  `;
}
