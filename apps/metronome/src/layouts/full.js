import { html, nothing } from 'lit';

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

let renderDoc = false;
let renderAdvancedOptions = false;
const breakpoint = 960;

export default function layoutFull(app) {
  return html`

    <div id="full">
      <div class="row-1">
        <div class="stave">
          <soap-stave-renderer
            .transport=${app.transport}
            .interpreter=${app.interpreter}
          ></soap-stave-renderer>
        </div>
        <div class="flash">
          <soap-flash-beat-renderer
            .transport=${app.transport}
            .interpreter=${app.interpreter}
          ></soap-flash-beat-renderer>
        </div>
        <div class="location">
          <div class="timer">
            <sc-clock
              .getTimeFunction=${() => app.transport.currentPosition}
            ></sc-clock>
          </div>
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
          <br />
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
          ></soap-metronome-renderer>
          <soap-score-examples
            @change=${e => app.setScore(e.detail.value)}
          ></soap-score-examples>
        </div>
        <div class="col-2">
          <soap-score-editor
            score=${app.score}
            @change=${e => app.setScore(e.detail.value)}
          ></soap-score-editor>
        </div>
      </div>
    </div>

    ${renderAdvancedOptions ? html`
      <div class="advanced-options">
        <h3>MTC</h3>
        <div>
          <div style="padding-bottom: 3px;">
            <sc-text>active MTC Receive</sc-text>
            <sc-toggle
              @change=${(e) => e.detail.value ? app.createMTCReceive() : app.deleteMTCReceive()}
              ?active=${(app.mtcReceive === null) ? false : true}
              ?disabled=${app.mtcSend}
            ></sc-toggle>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>active MTC Send</sc-text>
            <sc-toggle
              @change=${(e) => e.detail.value ? app.createMTCSend() : app.deleteMTCSend()}
              ?active=${(app.mtcSend === null) ? false : true}
              ?disabled=${app.mtcReceive}
            ></sc-toggle>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>input device</sc-text>
            <sc-select
              @change=${e => app.model.mtcParams.inputInterface = e.target.value}
              .options=${app.model.midiDeviceList.inputs}
              value=${app.model.mtcParams.inputInterface}
              ?disabled=${app.mtcSend || app.mtcReceive}
            ></sc-select>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>output device</sc-text>
            <sc-select
              .options=${app.model.midiDeviceList.outputs}
              value=${app.model.mtcParams.outputInterface}
              ?disabled=${app.mtcSend || app.mtcReceive}
              @change=${e => app.model.mtcParams.outputInterface = e.target.value}
            ></sc-select>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>mtc framerate</sc-text>
            <sc-select
              .options=${[24, 25, 30]}
              value=${app.model.mtcParams.framerate}
              ?disabled=${app.mtcSend || app.mtcReceive}
              @change=${e => app.model.mtcParams.framerate = e.detail.value}
            ></sc-select>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>max drift error in frame</sc-text>
            <sc-number
              min="0"
              value=${app.model.mtcParams.maxDriftError}
              @input=${e => app.model.mtcParams.maxDriftError = parseInt(Math.max(e.target.value,0))}
              ?disabled=${app.mtcSend || app.mtcReceive}
            ></sc-number>
        </div>
        <h3>Import</h3>
        <div class="dragndrop">
          <sc-dragndrop
            style="margin-bottom: 4px;"
            format="load"
            @change=${e => app.setScore(e.detail.value[Object.keys(e.detail.value)[0]])}
          >drag'n'drop SO(a)P</sc-dragndrop>
          <sc-dragndrop
            style="margin-bottom: 4px;"
            @change=${e => app.parseMidi(e.detail.value[Object.keys(e.detail.value)[0]])}
          >drag'n'drop MIDI</sc-dragndrop>
          <sc-dragndrop
            style="margin-bottom: 4px;"
            @change=${e => {
              const name = Object.keys(e.detail.value)[0];
              const data = e.detail.value[name];
              app.parseAugustin(data, name);
            }}
          >drag'n'drop Augustin</sc-dragndrop>
        </div>

        <h3>Export</h3>

        <div>
          <sc-button
            style="margin-bottom: 4px;"
            width="400"
            value="save to disk"
            @input="${e => app.savetoDisk()}"
          ></sc-button>
          <sc-button
            style="margin-bottom: 4px;"
            width="400"
            value="share link"
            @input="${e => app.copyToClipboard()}"
          ></sc-button>
          <sc-button
            style="margin-bottom: 4px;"
            width="400"
            value="export asco"
            @input="${e => app.exportToAntescofo()}"
          ></sc-button>
          <sc-button
            style="margin-bottom: 4px;"
            width="400"
            value="export audio"
            @input="${e => app.exportAudioFile()}"
          ></sc-button>
        </div>

        <h3>Test scores</h3>
        <div style="margin: 4px 0;">
          ${Object.keys(app.model.scoreList).map(name => {
            return html`
              <sc-button
                style="margin-bottom: 4px;"
                value="${name}"
                @input=${e => app.setScore(app.model.scoreList[name])}
              ></sc-button>
            `;
          })}
        </div>
      </div>
    ` : nothing}
<!--     <soap-score-import
      @change=${e => app.setScore(e.detail.value)}
    ></soap-score-import>
    <br />
    <soap-score-export
      .score=${app.score}
    ></soap-score-export> -->
  `;
}
