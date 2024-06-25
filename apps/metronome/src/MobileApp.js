
import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { html, render } from 'lit';

import SoapScoreInterpreter from '../../../src/SoapScoreInterpreter.js';

// import SoapProcessor from './processors/SoapProcessor.js';

import '@ircam/sc-components/sc-clock.js';
import './components/SoapTransportControl.js';
import './components/SoapMetronomeRenderer.js';
import './components/SoapFlashBeatRenderer.js';
import './components/SoapScoreLocationRenderer.js';
import './components/SoapStaveRenderer.js';
import './components/SoapScoreExamples.js';
import './components/SoapScoreGenerator.js';
import './components/SoapScoreEditor.js';
import './components/SoapScoreImport.js';
import './components/SoapScoreExport.js';
import './components/SoapMobileTransportControl.js';

class App {
  constructor(audioContext, buffers, defaultScore) {
    this.audioContext = audioContext;
    this.buffers = buffers;

    const getTime = () => audioContext.currentTime;
    this.scheduler = new Scheduler(getTime);
    this.transport = new Transport(this.scheduler);

    this.interpreter = null;
    this.score = null;

    this.setScore(defaultScore);
  }

  setScore(score) {
    this.transport.stop();

    this.score = score;
    this.interpreter = new SoapScoreInterpreter(score);
    // const processor = new SoapProcessor(this.interpreter);
    // this.transport.add(processor.process);

    this.render();
  }

  // @todo - provide several layouts
  render() {
    render(html`
      <div>
        <soap-stave-renderer
          .transport=${this.transport}
          .interpreter=${this.interpreter}
        ></soap-stave-renderer>
        <br >
        <sc-clock
          .getTimeFunction=${() => this.transport.currentPosition}
        ></sc-clock>
        <br />
        <soap-mobile-transport-control
          .transport=${this.transport}
          .interpreter=${this.interpreter}
          .audioContext=${this.audioContext}
          score=${this.score}
        ></soap-mobile-transport-control>
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
    `, document.body);
  }
}

export default App;
