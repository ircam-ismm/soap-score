import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { html, render } from 'lit';

import SoapScoreInterpreter from '../../../../../src/SoapScoreInterpreter.js';

// import SoapProcessor from './processors/SoapProcessor.js';

import '@ircam/sc-components/sc-clock.js';
import '../components/SoapTransportControl.js';
import '../../../../metronome/src/components/SoapMetronomeRenderer.js';
import '../../../../metronome/src/components/SoapFlashBeatRenderer.js';
import '../../../../metronome/src/components/SoapScoreLocationRenderer.js';
import '../../../../metronome/src/components/SoapStaveRenderer.js';
import '../../../../metronome/src/components/SoapScoreExamples.js';
import '../../../../metronome/src/components/SoapScoreGenerator.js';
import '../../../../metronome/src/components/SoapScoreEditor.js';
import '../../../../metronome/src/components/SoapScoreImport.js';
import '../../../../metronome/src/components/SoapScoreExport.js';

class App {
  constructor(client, $container, audioContext, buffers, defaultScore) {
    this.client = client;
    this.$container = $container;
    this.audioContext = audioContext;
    this.buffers = buffers;
    this.defaultScore = defaultScore;

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

    alert(this.audioContext.outputLatency);
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

  // @todo - provide several layouts
  render() {
    render(html`
      <div>
        <sc-clock
          .getTimeFunction=${() => this.transport.currentPosition}
        ></sc-clock>
        <br />
        <soap-transport-control
          .global=${this.global}
          .transport=${this.transport}
          .interpreter=${this.interpreter}
          .audioContext=${this.audioContext}
          score=${this.score}
        ></soap-transport-control>

        <br />
        <soap-flash-beat-renderer
          .transport=${this.transport}
          .interpreter=${this.interpreter}
        ></soap-flash-beat-renderer>
        <br />
        <soap-score-location-renderer
          .transport=${this.transport}
          .interpreter=${this.interpreter}
        ></soap-score-location-renderer>
        <br />
        <soap-stave-renderer
          .transport=${this.transport}
          .interpreter=${this.interpreter}
        ></soap-stave-renderer>
        <br >
        <soap-score-editor
          score=${this.score}
          @change=${e => this.setScore(e.detail.value)}
        ></soap-score-editor>
        <br >
        <soap-metronome-renderer
          .transport=${this.transport}
          .interpreter=${this.interpreter}
          .audioContext=${this.audioContext}
          .buffers=${this.buffers}
          .audioOutput=${this.audioContext.destination}
        ></soap-metronome-renderer>
        <br />
        <soap-score-examples
          @change=${e => this.setScore(e.detail.value)}
        ></soap-score-examples>
        <br />
        <soap-score-generator
          @change=${e => this.setScore(e.detail.value)}
        ></soap-score-generator>
        <br />
        <soap-score-import
          @change=${e => this.setScore(e.detail.value)}
        ></soap-score-import>
        <br />
        <soap-score-export
          .score=${this.score}
        ></soap-score-export>
      </div>
    `, this.$container);
  }
}

export default App;

