import { html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';

import '@ircam/sc-components';

import './sc-progress-bar.js';
import './sc-chenillard.js';

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
        <img src="./assets/logo-200x200.png" />
        <h1>SO(a)P Metronome</h1>
        <a href="#" @click=${e => {
          e.preventDefault();
          renderDoc = !renderDoc;
          app.render();
        }}>Syntax documentation</a>
      </div>
      <div style="font-size: 0;">
        <sc-clock format="hh:mm:ss"></sc-clock>
        <sc-icon type="github" href="https://github.com/ircam-ismm/soap-score"></sc-icon>
        <sc-icon
          type="burger"
          @input=${e => {
            renderAdvancedOptions = !renderAdvancedOptions;
            app.render();
          }}
        ></sc-icon>
      </div>
    </header>

    ${renderDoc ? html`<div class="doc">${unsafeHTML(doc)}</div>` : nothing }

    ${renderAdvancedOptions ? html`
      <div class="advanced-options">
        <!-- @TODO - fix me

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
              .options=${Object.keys(app.model.midiDeviceList.inputs)}
              value=${app.model.mtcParams.inputInterface}
              ?disabled=${app.mtcSend || app.mtcReceive}
            ></sc-select>
          </div>
          <div style="padding-bottom: 3px;">
            <sc-text>output device</sc-text>
            <sc-select
              .options=${Object.keys(app.model.midiDeviceList.outputs)}
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
        -->

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


    <!-- main screen -->
    <section>
      <!-- top row -->
      <div class="feedback">
        <div class="col-1">
          <div class="bar-beats">
            <div class="bar">
              ${app.soapEngine.current && app.soapEngine.current.event.duration
                ? html`<div>Duration: ${app.soapEngine.current.event.duration}s</div>`
                : html`
                  ${renderTimeSignature(app.soapEngine)}
                  ${renderTempo(app.soapEngine)}
                `
              }
            </div>
            <div class="beats">
              <sc-flash
                duration="0.15"
                color="brown"
                .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat === 1 : false)}"
              ></sc-flash>
              <sc-flash
                duration="0.15"
                color="limegreen"
                .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat !== 1 : false)}"
              ></sc-flash>
            </div>
          </div>

          <div class="progress-bar">
          <!-- @todo - fixme -->
          ${app.soapEngine.current && app.soapEngine.current.event.duration
            ? html `
              <sc-progress-bar
                .getProgressFunction=${app.getPositionInAbsoluteEvent}
                min="0"
                max="${app.soapEngine.current && app.soapEngine.current.event.duration ? app.soapEngine.current.event.duration : 1}"
                displayNumber
              ></sc-progress-bar>`
            : html`
              <sc-chenillard
                .getProgressFunction=${app.getTempoPosition}
              ></sc-chenillard>
            `
          }
          </div>
        </div>

        <div class="col-2">
          <sc-clock
            .getTimeFunction=${app.getTransportPosition}
            twinkle
            format="hh:mm:ss:ms"
          ></sc-clock>
          <sc-text>
            ${app.soapEngine.bar}|${app.soapEngine.beat}
          </sc-text>
          <sc-text>
            ${app.soapEngine.current && app.soapEngine.current.event ? app.soapEngine.current.event.label : ''}
          </sc-text>
        </div>
      </div>


      <!-- bottom row -->
      <div class="controls">
        <div class="col-1">
          <div class="generate-score">
            <div style="margin: 4px 0;">
              <sc-text>Time signature</sc-text>
              <sc-number
                min="0"
                integer
                @change=${e => app.generateScore('signatureUpper', e.detail.value)}
              ></sc-number>
              <sc-text style="width: 20px">/</sc-text>
              <sc-number
                min="0"
                value="4"
                integer
                @change=${e => app.generateScore('signatureLower', e.detail.value)}
              ></sc-number>
            </div>
            <div style="margin: 4px 0;">
              <sc-text>Tempo</sc-text>
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
              <sc-text>BPM basis</sc-text>
              <sc-select
                .options=${['1/4', '1/8', '1/2', '3/8', '3/16', '3/4']}
                @change=${e => app.generateScore('basis', e.target.value)}
              ></sc-select>
            </div>
          </div>

          <div class="transport-control">
            <div style="margin-bottom: 20px;">
              <sc-transport
                ?disabled=${app.mtcReceive}
                .buttons=${['play', 'stop']}
                state="${app.getTransportState()}"
                @change=${e => app.setTransportState(e.detail.value)}
              ></sc-transport>
            </div>
            <div>
              <sc-text style="width: 130px;">start at position</sc-text>
              <sc-prev
                @input=${e => app.seekToLocation(1, 1)}
              ></sc-prev>
              <sc-number
                min="1"
                integer
                value="${app.model.seekLocation.bar}"
                @change=${e => app.seekToLocation(e.detail.value, app.model.seekLocation.beat)}
              ></sc-number>
              <sc-number
                min="1"
                integer
                value="${app.model.seekLocation.beat}"
                @change=${e => app.seekToLocation(app.model.seekLocation.bar, e.detail.value)}
              ></sc-number>
            </div>
            <div>
              <sc-text style="width: 150px">loop</sc-text>
              <sc-loop
                @change=${e => app.setTransportLoop(e.detail.value)}
              ></sc-loop>
              <div style="margin-top: 4px">
                <sc-text style="width: 62px;">from</sc-text>
                <sc-number
                  min="1"
                  integer
                  value="${app.model.loopState.start.bar}"
                  @change=${e => app.setLoopStartLocation(e.detail.value, app.model.loopState.start.beat)}
                ></sc-number>
                <sc-number
                  min="1"
                  integer
                  value="${app.model.loopState.start.beat}"
                  @change=${e => app.setLoopStartLocation(app.model.loopState.start.bar, e.detail.value)}
                ></sc-number>
              </div>
              <div style="margin-top: 4px">
                <sc-text style="width: 62px">to</sc-text>
                <sc-number
                  min="1"
                  integer
                  value="${app.model.loopState.end.bar}"
                  @change=${e => app.setLoopEndLocation(e.detail.value, app.model.loopState.end.beat)}
                ></sc-number>
                <sc-number
                  min="1"
                  integer
                  value="${app.model.loopState.end.beat}"
                  @change=${e => app.setLoopEndLocation(app.model.loopState.end.bar, e.detail.value)}
                ></sc-number>
              </div>
            </div>
            <div>
              <sc-text>sonification style</sc-text>
              <sc-select
                .options=${['auto', 'beat', 'double', 'bar', 'odd', 'even']}
                @change=${e => app.setSonificationMode(e.target.value)}
              ></sc-select>
            </div>
            <div>
              <sc-text>sound</sc-text>
              <sc-select
                .options=${['sine', 'drum', 'old-numerical', 'mechanical', 'drumstick']}
                @change=${(e) => app.setMetroSound(e.target.value)}
              ></sc-select>
            </div>
            <div>
              <sc-text style="width: 320px">labels</sc-text>
              <br />
              ${app.soapEngine.interpreter.getLabels().map(name => {
                return html`
                  <sc-button
                    style="padding-bottom: 2px;"
                    @input=${e => app.jumpToLabel(name)}
                  >${name}</sc-button>
                `;
              })}
            </div>
          </div>
        </div>

        <div class="col-2">
          <sc-editor
            value="${app.model.score}"
            @change=${e => app.setScore(e.detail.value)}
          ></sc-editor>
        </div>
      </div>

    </section>
  `;
}
