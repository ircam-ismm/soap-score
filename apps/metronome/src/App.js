import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { html, render } from 'lit';

import SoapScoreInterpreter from '../../../src/SoapScoreInterpreter.js';

import SoapProcessor from './processors/SoapProcessor.js';

import '@ircam/sc-components/sc-clock.js';
import './views/SoapTransportControl.js';
import './views/SoapFlashBeatRenderer.js';
import './views/SoapScoreLocationRenderer.js';


const defaultScore = `BAR 1 [4/4] TEMPO [1/4]=90`;

class App {
  constructor(audioContext) {
    this.audioContext = audioContext;

    const getTime = () => audioContext.currentTime;
    this.scheduler = new Scheduler(getTime);
    this.transport = new Transport(this.scheduler);
    this.interpreter = null;

    this.setScore(defaultScore);
  }

  setScore(score) {
    this.transport.clear();

    this.interpreter = new SoapScoreInterpreter(score);
    const processor = new SoapProcessor(this.interpreter);
    this.transport.add(processor.process);

    this.render();
  }

  render() {
    render(html`
      <header>

      </header>
      <div>
        <sc-clock
          .getTimeFunction=${() => this.transport.currentPosition}
        ></sc-clock>
        <soap-transport-control
          .transport=${this.transport}
          .audioContext=${this.audioContext}
        ></soap-transport-control>
        <br />
        <br />
        <soap-flash-beat-renderer
          .transport=${this.transport}
          .interpreter=${this.interpreter}
        ></soap-flash-beat-renderer>
        <br />
        <br />
        <soap-score-location-renderer
          .transport=${this.transport}
          .interpreter=${this.interpreter}
        ></soap-score-location-renderer>
      </div>
    `, document.body);
  }
}

export default App;
