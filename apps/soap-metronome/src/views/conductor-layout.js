import { html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';

import '@ircam/sc-components';

import './sc-progress-bar.js';  

import { renderTempo, renderTimeSignature } from './staves.js';

let renderDoc = false;
let renderAdvancedOptions = false;
const breakpoint = 960;

export default function conductorLayout(app) {
  return html`
    <div id="conductor">
      <div class="row row-1" style="background-color: yellow">
        <div style="position: fixed; top: 1px; right: 1px">
          <sc-fullscreen></sc-fullscreen>
        </div>
        <sc-clock 
        style="margin-bottom: 3px;"
        format="hh:mm"
        ></sc-clock>
        <sc-clock 
          style="width:100%; height: 50px; font-size: 34px; margin-bottom: 3px;"
          .getTimeFunction=${app.getTransportPosition}
          twinkle
          format="hh:mm:ss:ms"
        ></sc-clock>
        <sc-button style="width:100%; height: 50px; font-size: 34px; margin-bottom: 3px;"> 
          ${app.soapEngine.current && app.soapEngine.current.event ? app.soapEngine.current.event.label : ''}
        </sc-button>
      </div>
      <div class="row row-2" style="background-color: red">
        <div class="col col-1" style="background-color: purple">
          <sc-button
            style="width:100%; height: 50px; font-size: 34px; margin-bottom: 3px;"
            value="Measure ${app.soapEngine.bar} | ${app.soapEngine.beat}""
          ></sc-button>
          <sc-button
            style="width:75%; height: 30px; font-size: 18px; margin-bottom: 3px;"
            value="${app.soapEngine.beat}"
          ></sc-button>
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
            <sc-transport
              ?disabled=${app.mtcReceive}
              .buttons=${['play', 'stop']}
              state="${app.getTransportState()}"
              @change=${e => app.setTransportState(e.detail.value)}
            ></sc-transport>
          </div>
        </div>
        <div class="col col-2" style="background-color: grey">
          <div class="col col-2 sous-col-1" style="background-color: grey;">
            <div class="flash">
              <sc-flash
                style="width:300px; height: 300px;"
                duration="0.15"
                color="brown"
                .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat === 1 : false)}"
              ></sc-flash>
              <sc-flash
                style="width:300px; height: 300px; --sc-flash-active: var(--sc-color-secondary-1);"
                duration="0.15"
                color="--sc-flash-active: var(--sc-color-secondary-1);"
                .active="${live(app.model.displayActiveBeat ? app.soapEngine.beat !== 1 : false)}"
              ></sc-flash>
            </div>
          </div>
          <div class="col col-2 sous-col-2" style="background-color: blue;">
            <sc-button
              style="width:40%; height: 35px; font-size: 18px; margin-bottom: 3px;"
              value="Tempo: 
              ${app.soapEngine.current
              ? ` ${app.soapEngine.current.event.tempo.bpm}` 
              : ''}"
            ></sc-button>
            <sc-button
              style="width:25%; height: 100px; font-size: 40px; font-family: serif; margin-bottom: 3px;"
              value="${app.soapEngine.current.event.signature.upper}"
            ></sc-button>
            <sc-button
              style="width:25%; height: 100px; font-size: 40px; font-family: serif; margin-bottom: 3px;"
              value="${app.soapEngine.current.event.signature.lower}"
            ></sc-button>
          </div>
        </div>
      </div>
    </div>
  `;
}
