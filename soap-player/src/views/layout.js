import { html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';

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
import '@ircam/simple-components/sc-dragndrop.js';
import '@ircam/simple-components/sc-clock.js';
import '@ircam/simple-components/sc-progress-bar.js';
import '@ircam/simple-components/sc-chenillard.js';
import '@ircam/simple-components/sc-gh-link.js';
import '@ircam/simple-components/sc-flash.js';
import '@ircam/simple-components/sc-icon-button.js';

import { renderTempo, renderTimeSignature } from './staves.js';

let renderDoc = false;
let renderAdvancedOptions = false;
const breakpoint = 960;

export default function layout(app) {
  const width = window.innerWidth;
  const height = window.innerHeight - 40;
  const headerRatio = 0.20;

  const doc = marked.parse(app.syntaxDoc, { gfm: true });

  return html`
    <header>
      <div>
        <h1>SO(a)P Metronome</h1>
        <a href="#" @click=${e => {
          e.preventDefault();
          renderDoc = !renderDoc;
          app.render();
        }}>Syntax documentation</a>
      </div>
      <div style="font-size: 0;">
        <sc-icon-button height="40"
          @click=${e => {
            e.preventDefault();
            renderAdvancedOptions = !renderAdvancedOptions;
            app.render();
          }}
        ></sc-icon-button>
        <sc-gh-link height="40" href="https://github.com/ircam-ismm/soap-score"></sc-gh-link>
        <sc-clock height="40" width="100"></sc-clock>
      </div>
    </header>

    ${renderDoc ? html`<div class="doc">${unsafeHTML(doc)}</div>` : nothing }

    ${renderAdvancedOptions ? html`
      <div class="advanced-options">
        <h3>MTC</h3>

        <div>
          <sc-text
            value="active MTC Receive"
            readonly
          ></sc-text>
          <sc-toggle
            @change="${(e) => e.detail.value ? app.createMTCReceive() : app.deleteMTCReceive()}"
            ?active="${(app.mtcReceive === null) ? false : true}"
            ?disabled=${app.mtcSend}
          ></sc-toggle>
          </br>
          <sc-text
            value="active MTC Send"
            readonly
          ></sc-text>
          <sc-toggle
            @change="${(e) => e.detail.value ? app.createMTCSend() : app.deleteMTCSend()}"
            ?active="${(app.mtcSend === null) ? false : true}"
            ?disabled=${app.mtcReceive}
          ></sc-toggle>
          </br>
          <sc-text
            value="input device"
            readonly
          ></sc-text>
          <select
            @change=${e => app.model.mtcParams.inputInterface = e.target.value}
            ?disabled=${app.mtcSend || app.mtcReceive}
          >
            ${Object.keys(app.model.midiDeviceList.inputs).map(name => {
              return html`<option value="${app.model.midiDeviceList.inputs[name]}" ?selected="${name === app.model.mtcParams.inputInterface}">${app.model.midiDeviceList.inputs[name]}</option>`;
            })}
          </select>
          </br>
          <sc-text
            value="output device"
            readonly
          ></sc-text>
          <select
            @change=${e => app.model.mtcParams.outputInterface = e.target.value}
            ?disabled=${app.mtcSend || app.mtcReceive}
          >
            ${Object.keys(app.model.midiDeviceList.outputs).map(name => {
              return html`<option value="${app.model.midiDeviceList.outputs[name]}" ?selected="${name === app.model.mtcParams.outputInterface}">${app.model.midiDeviceList.outputs[name]}</option>`;
            })}
          </select>
          </br>
          <sc-text
            value="mtc framerate"
            readonly
          ></sc-text>
          <select
            @change=${e => app.model.mtcParams.framerate = parseInt(e.target.value)}
            ?disabled=${app.mtcSend || app.mtcReceive}
          >
            ${[24, 25, 30].map(framerate => {
              return html`
                <option value="${framerate}" ?selected="${framerate === app.model.mtcParams.framerate}">${framerate}</option>
              `;
            })}
          </select>
          </br>
          <sc-text
            value="max drift error in frame"
            readonly
          ></sc-text>
          <input
            @input=${e => app.model.mtcParams.maxDriftError = parseInt(Math.max(e.target.value,0))}
            value="${app.model.mtcParams.maxDriftError}"
            type="number"
            min="0"
            ?disabled=${app.mtcSend || app.mtcReceive}
          ></input>
        </div>


        <h3>Import</h3>

        <div class="dragndrop">
          <sc-dragndrop
            style="margin-bottom: 4px;"
            width="400"
            height="100"
            label="drag'n'drop soap"
            format="load"
            @change=${(e) => {app.setScore(e.detail.value[Object.keys(e.detail.value)[0]])
            }}
          ></sc-dragndrop>
          <sc-dragndrop
            style="margin-bottom: 4px;"
            width="400"
            height="100"
            label="drag'n'drop midi"
            @change=${(e) => {
              app.parseMidi(e.detail.value[Object.keys(e.detail.value)[0]])
            }}
          ></sc-dragndrop>
          <sc-dragndrop
            style="margin-bottom: 4px;"
            width="400"
            height="100"
            label="drag'n'drop augustin"
            @change=${(e) => {
              app.parseAugustin(e.detail.value)
            }}
          ></sc-dragndrop>
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
            return html`<sc-button
              style="padding-bottom: 2px; display: block;"
              width="400"
              value="${name}"
              @input=${e => app.setScore(app.model.scoreList[name])}
            ></sc-button>
            `;
          })}
        </div>
      </div>
    ` : nothing}

    <section>
      <div class="feedback">
        <div>
          <div class="bar-infos">
            ${app.soapEngine.current && app.soapEngine.current.event.duration
              ? html`Duration: ${app.soapEngine.current.event.duration}s`
              : html`
                ${renderTimeSignature(app.soapEngine)}
                ${renderTempo(app.soapEngine)}
              `
            }
          </div>
          <div class="beats">
            <sc-flash
              height="${parseInt(height * headerRatio) / 2}"
              width="${width < breakpoint ? parseInt(width / 2) : parseInt(width / 4)}"
              flashTime="150"
              color="brown"
              .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat === 1 : false)}"
            ></sc-flash>
            <sc-flash
              height="${parseInt(height * headerRatio) / 2}"
              width="${width < breakpoint ? parseInt(width / 2) : parseInt(width / 4)}"
              flashTime="150"
              color="limegreen"
              .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat !== 1 : false)}"
            ></sc-flash>
          </div>

          <div class="progress-bar">
          ${app.soapEngine.current && app.soapEngine.current.event.duration
            ? html `
              <sc-progress-bar
                .getProgressFunction=${app.getPositionInAbsoluteEvent}
                min="0"
                max="${app.soapEngine.current && app.soapEngine.current.event.duration ? app.soapEngine.current.event.duration : 1}"
                width="${parseInt(width / 2)}"
                height="40"
                displayNumber
              ></sc-progress-bar>`
            : html`
              <sc-chenillard
                .getProgressFunction=${app.getTempoPosition}
                width=${width < breakpoint ? width : parseInt(width / 2)}
                height="40"
              ></sc-chenillard>
            `
          }
          </div>
        </div>
        <div class="clocks">
          <sc-clock
            width=${width < breakpoint ? width : parseInt(width / 2)}
            height="${parseInt(height * headerRatio / 3)}"
            .getTimeFunction=${app.getTransportPosition}
            font-size="30"
            twinkle="[0, 0.5]"
          ></sc-clock>
          <div
            class="bar-beat"
            style="
              width: ${width < breakpoint ? '100%' : `${parseInt(width / 2)}px`};
              height: ${parseInt(height * headerRatio / 3)}px;
              line-height: ${parseInt(height * headerRatio / 3)}px;
            "
          >${app.soapEngine.bar}|${app.soapEngine.beat}</div>
          <div
            class="bar-beat"
            style="
              width: ${width < breakpoint ? '100%' : `${parseInt(width / 2)}px`};
              height: ${parseInt(height * headerRatio / 3)}px;
              line-height: ${parseInt(height * headerRatio / 3)}px;
            "
          >${app.soapEngine.current && app.soapEngine.current.event ? app.soapEngine.current.event.label : ''}</div>
        </div>
      </div>
      <div class="controls">
        <div class="first-column">
          <div class="generate-score">
            <div style="margin: 4px 0;">
              <sc-text
                value="Time signature"
                width="150"
                readonly
              ></sc-text>
              <sc-number
                min="0"
                value="4"
                width="70"
                integer
                @change=${e => app.generateScore('signatureUpper', e.detail.value)}
              ></sc-number>
              <sc-text
                value="/"
                width="20"
                readonly
              ></sc-text>
              <sc-number
                min="0"
                value="4"
                width="70"
                integer
                @change=${e => app.generateScore('signatureLower', e.detail.value)}
              ></sc-number>
            </div>
            <div style="margin: 4px 0;">
              <sc-text
                value="Tempo"
                width="150"
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
                value="BPM basis"
                width="150"
                readonly
              ></sc-text>
              <select
                @change=${e => app.generateScore('basis', e.target.value)}
              >
                <option value="1/4">1/4</option>
                <option value="1/8">1/8</option>
                <option value="1/2">1/2</option>
                <option value="3/8">3/8</option>
                <option value="3/16">3/16</option>
                <option value="3/4">3/4</option>
              </select>
            </div>
          </div>

          <div class="transport-control">
            <div style="margin-bottom: 20px;">
              ${!app.mtcReceive ?
              html`
              <sc-transport
                buttons="[play, stop]"
                width="100"
                state="${app.getTransportState()}"
                @change=${e => app.setTransportState(e.detail.value)}
              ></sc-transport>`
              :
              html`
              <sc-transport
                buttons="[play, stop]"
                width="100"
                state="${app.getTransportState()}"
              ></sc-transport>`}
            </div>
            <div>
              <sc-text
                value="start at position"
                width="130"
                readonly
              ></sc-text>
              <sc-return
                @input=${e => app.seekToLocation(1, 1)}
              ></sc-return>
              <sc-number
                min="1"
                integer
                width="80"
                value="${app.model.seekLocation.bar}"
                @change=${e => app.seekToLocation(e.detail.value, app.model.seekLocation.beat)}
              ></sc-number>
              <sc-number
                min="1"
                integer
                width="80"
                value="${app.model.seekLocation.beat}"
                @change=${e => app.seekToLocation(app.model.seekLocation.bar, e.detail.value)}
              ></sc-number>
            </div>
            <div>
              <sc-text
                value="loop"
                width="150"
                readonly
              ></sc-text>
              <sc-loop
                @change=${e => app.setTransportLoop(e.detail.value)}
              ></sc-loop>
              <div style="margin-top: 4px">
                <sc-text
                  value="from"
                  readonly
                  width="62"
                ></sc-text>
                <sc-number
                  min="1"
                  integer
                  width="80"
                  value="${app.model.loopState.start.bar}"
                  @change=${e => app.setLoopStartLocation(e.detail.value, app.model.loopState.start.beat)}
                ></sc-number>
                <sc-number
                  min="1"
                  integer
                  width="80"
                  value="${app.model.loopState.start.beat}"
                  @change=${e => app.setLoopStartLocation(app.model.loopState.start.bar, e.detail.value)}
                ></sc-number>
              </div>
              <div style="margin-top: 4px">
                <sc-text
                  value="to"
                  readonly
                  width="62"
                ></sc-text>
                <sc-number
                  min="1"
                  integer
                  width="80"
                  value="${app.model.loopState.end.bar}"
                  @change=${e => app.setLoopEndLocation(e.detail.value, app.model.loopState.end.beat)}
                ></sc-number>
                <sc-number
                  min="1"
                  integer
                  width="80"
                  value="${app.model.loopState.end.beat}"
                  @change=${e => app.setLoopEndLocation(app.model.loopState.end.bar, e.detail.value)}
                ></sc-number>
              </div>
            </div>
            <div>
              <sc-text
                value="sonification style"
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
            <div>
              <sc-text
                value="sound"
                readonly
              ></sc-text>
              <select @change=${(e) => app.setMetroSound(e.target.value)}>
                <option value="sine">sine</option>
                <option value="drum">drum</option>
                <option value="old-numerical">old-numerical</option>
                <option value="mechanical">mechanical</option>
                <option value="drumstick">drumstick</option>
              </select>
            </div>
            <div>
              <sc-text
                width="320"
                value="labels"
                readonly
              ></sc-text>
              <br />
              ${app.soapEngine.interpreter.getLabels().map(name => {
                return html`<sc-button
                  style="padding-bottom: 2px;"
                  value="${name}"
                  @input=${e => app.jumpToLabel(name)}
                ></sc-button>
                `;
              })}
            </div>
          </div>
        </div>

        <div class="second-column">
          <sc-editor
            width=${width < breakpoint ? width : parseInt(width / 2)}
            height="${parseInt(height - (height * headerRatio))}"
            value="${app.model.score}"
            @change=${e => app.setScore(e.detail.value)}
          ></sc-editor>
        </div>
      </div>

    </section>
  `;
}
