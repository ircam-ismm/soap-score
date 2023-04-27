import { html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';

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

import { renderTempo, renderTimeSignature } from './staves.js';

export default function layout(app) {
  const width = window.innerWidth;
  const height = window.innerHeight - 40;
  const headerRatio = 0.20;

  return html`
    <header>
      <h1>SO(a)P Metro</h1>
    </header>
    <section>
      <div class="feedback">
        <div>
          <div class="bar-infos">
            ${renderTimeSignature(app.soapEngine)}
            ${renderTempo(app.soapEngine)}
          </div>
          <div class="beats">
            <sc-bang
              width="${Math.min(120, parseInt(height * headerRatio))}"
              .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat === 1 : false)}"
            ></sc-bang>
            <sc-bang
              width="${Math.min(120, parseInt(height * headerRatio))}"
              .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat !== 1 : false)}"
            ></sc-bang>
          </div>

          ${app.soapEngine.current && app.soapEngine.current.event.duration
            ? html `
            <div class="progress-bar">
              <sc-progress-bar
                .getProgressFunction=${app.getPositionInAbsoluteEvent}
                min="0"
                max="${app.soapEngine.current && app.soapEngine.current.event.duration ? app.soapEngine.current.event.duration : 1}"
                width="${parseInt(width / 2)}"
                heigh="50"
                displayNumber
              ></sc-progress-bar>
            </div>`
            : nothing
          }
        </div>
        <div>
          <sc-clock
            width="${parseInt(width / 2)}"
            height="${parseInt(height * headerRatio / 3)}"
            .getTimeFunction=${app.getTransportPosition}
            font-size="30"
            twinkle="[0, 0.5]"
          ></sc-clock>
          <div
            class="bar-beat"
            style="
              width: ${parseInt(width / 2)}px;
              height: ${parseInt(height * headerRatio / 3)}px;
              line-height: ${parseInt(height * headerRatio / 3)}px;
            "
          >${app.soapEngine.bar}|${app.soapEngine.beat}</div>
          <div
            class="bar-beat"
            style="
              width: ${parseInt(width / 2)}px;
              height: ${parseInt(height * headerRatio / 3)}px;
              line-height: ${parseInt(height * headerRatio / 3)}px;
            "
          >${app.soapEngine.current && app.soapEngine.current.event ? app.soapEngine.current.event.label : ''}</div>
        </div>
      </div>
      <div class="controls">
        <div class="first-column">
          <div>
            <sc-transport
              buttons="[play, stop]"
              width="100"
              state="${app.getTransportState()}"
              @change=${e => app.setTransportState(e.detail.value)}
            ></sc-transport>
          </div>
          <div>
            <sc-text
              value="start at position"
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
          <div style="margin: 40px 0;">
            <sc-text
              value="mode de sonification"
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
          <div style="margin: 40px 0;">
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

          <hr />

          <h3
            style="margin: 20px 0 10px; font-size: 16px;"
          >Test scores</h3>
          <div style="margin: 4px 0;">
            ${Object.keys(app.model.scoreList).map(name => {
              return html`<sc-button
                style="padding-bottom: 2px;"
                value="${name}"
                @input=${e => app.setScore(app.model.scoreList[name])}
              ></sc-button>
              `;
            })}
          </div>
        </div>

        <div class="second-column">
          <div class="generate-score">
            <div style="margin: 4px 0;">
              <sc-text
                value="Time signature"
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

            <div class="dragndrop">
              <sc-dragndrop
                width="150"
                height="40"
                label="drag'n'drop soap"
                format="load"
                @change=${(e) => {app.setScore(e.detail.value[Object.keys(e.detail.value)[0]])
                }}
              ></sc-dragndrop>
              <sc-dragndrop
                width="150"
                height="40"
                label="drag'n'drop midi"
                @change=${(e) => {
                  app.parseMidi(e.detail.value[Object.keys(e.detail.value)[0]])
                }}
              ></sc-dragndrop>
              <sc-dragndrop
                width="150"
                height="40"
                label="drag'n'drop augustin"
                @change=${(e) => {
                  app.parseAugustin(e.detail.value[Object.keys(e.detail.value)[0]])
                }}
              ></sc-dragndrop>
            </div>
          </div>
          <sc-editor
            width="${parseInt(width  / 2)}"
            height="${parseInt(height - (height * headerRatio) - 140)}"
            value="${app.model.score}"
            @change=${e => app.setScore(e.detail.value)}
          ></sc-editor>
          <sc-button
            style="position: absolute; bottom: 4px; right: 130px;"
            value="save to disk"
            @input="${e => app.savetoDisk()}"
          ></sc-button>

        </div>
      </div>

    </section>
  `;
}
