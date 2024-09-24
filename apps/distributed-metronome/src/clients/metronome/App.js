import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { html, render, nothing } from 'lit';

import SoapScoreInterpreter from '../../../../../src/SoapScoreInterpreter.js';

// import SoapProcessor from './processors/SoapProcessor.js';

import '@ircam/sc-components/sc-clock.js';

import '../components/SoapTransportControl.js';
// import '@ircam/soap-score/components/SoapTransportControl.js';

import '@ircam/soap-score/components/SoapMetronomeRenderer.js';
import '@ircam/soap-score/components/SoapFlashBeatRenderer.js';
import '@ircam/soap-score/components/SoapScoreLocationRenderer.js';
import '@ircam/soap-score/components/SoapStaveRenderer.js';
import '@ircam/soap-score/components/SoapScoreExamples.js';
import '@ircam/soap-score/components/SoapScoreGenerator.js';
import '@ircam/soap-score/components/SoapScoreEditor.js';
import '@ircam/soap-score/components/SoapScoreImport.js';
import '@ircam/soap-score/components/SoapScoreExport.js';

class App {
  constructor(client, $container, audioContext, buffers, defaultScore) {
    this.client = client;
    this.$container = $container;
    this.audioContext = audioContext;
    this.buffers = buffers;
    this.defaultScore = defaultScore;
    this.renderAdvancedOptions = false;

    this.interpreter = null;
    this.score = null;
  }

  async init() {
    this.global = await this.client.stateManager.attach('global');
    this.sync = await this.client.pluginManager.get('sync');

    this.scheduler = new Scheduler(() => this.sync.getSyncTime(), {
      currentTimeToProcessorTimeFunction: time => this.sync.getLocalTime(time),
      // lookahead: Math.max(0.05, this.audioContext.outputLatency + 0.02),
    });

    this.transport = new Transport(this.scheduler, this.global.get('transportState'));

    this.global.onUpdate(updates => {
      if ('transportEvents' in updates) {
        this.transport.addEvents(updates.transportEvents);
      }
    });

    // if no default score given through URL param, use global score
    if (this.defaultScore === null) {
      this.defaultScore = this.global.get('score');
    }

    this.setScore(this.defaultScore, true);
  }

  setScore(score, init = false) {
    this.score = score;
    this.interpreter = new SoapScoreInterpreter(score);

    this.render();
  }

  render() {
    render(html`
      <header>
        <div>
          <img src="./assets/logo-200x200.png" />
          <h1>SO(a)P Metronome</h1>
           <a
            href="https://github.com/ircam-ismm/soap-score/blob/main/docs/SYNTAX.md"
            target="_blank"
          >Syntax documentation</a>
        </div>
        <div style="font-size: 0;">
          <sc-clock format="hh:mm:ss"></sc-clock>
          <sc-icon type="github" href="https://github.com/ircam-ismm/soap-score"></sc-icon>
          <sc-icon
            type="burger"
            @input=${e => {
              this.renderAdvancedOptions = !this.renderAdvancedOptions;
              this.render();
            }}
          ></sc-icon>
        </div>
      </header>
      <div id="full">
        <div class="row-1">
          <div class="col-1">
            <div>
              <soap-stave-renderer
                .transport=${this.transport}
                .interpreter=${this.interpreter}
              ></soap-stave-renderer>
              <soap-flash-beat-renderer
                .transport=${this.transport}
                .interpreter=${this.interpreter}
              ></soap-flash-beat-renderer>
            </div>
            <soap-progress-beat-renderer
              .transport=${this.transport}
              .interpreter=${this.interpreter}
            ></soap-progress-beat-renderer>
          </div>
          <div class="col-2">
            <sc-clock
              .getTimeFunction=${() => this.transport.currentPosition}
            ></sc-clock>
            <soap-score-location-renderer
              .transport=${this.transport}
              .interpreter=${this.interpreter}
            ></soap-score-location-renderer>
          </div>
        </div>
        <div class ="row-2">
          <div class="col-1">
            <soap-score-generator
              @change=${e => this.setScore(e.detail.value)}
            ></soap-score-generator>
            <soap-transport-control
              .global=${this.global}
              .transport=${this.transport}
              .interpreter=${this.interpreter}
              .audioContext=${this.audioContext}
              score=${this.score}
            ></soap-transport-control>
            <soap-metronome-renderer
              .transport=${this.transport}
              .interpreter=${this.interpreter}
              .audioContext=${this.audioContext}
              .buffers=${this.buffers}
              .audioOutput=${this.audioContext.destination}
              sonification=${this.sonification}
              sonificationMode=${this.sonificationMode}
              @change=${e => this.updateSonification(e.detail.key, e.detail.value)}
            ></soap-metronome-renderer>
            <soap-score-export
              .score=${this.score}
              .interpreter=${this.interpreter}
              .buffers=${this.buffers}
              sonification=${this.sonification}
              sonificationMode=${this.sonificationMode}
            ></soap-score-export>
          </div>
          <soap-score-editor class="col-2"
            score=${this.score}
            @change=${e => this.setScore(e.detail.value)}
          ></soap-score-editor>
        </div>

        ${this.renderAdvancedOptions
          ? html`
            <div class="advanced-options">
              <soap-score-examples
                @change=${e => this.setScore(e.detail.value)}
              ></soap-score-examples>
              <soap-score-import
                @change=${e => this.setScore(e.detail.value)}
              ></soap-score-import>
            </div>`
          : nothing
        }
      </div>
    `, this.$container);
  }
}

export default App;

