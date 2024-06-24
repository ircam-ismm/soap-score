import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { html, render } from 'lit';

import SoapScoreInterpreter from '../../../src/SoapScoreInterpreter.js';

// import SoapProcessor from './processors/SoapProcessor.js';

import '@ircam/sc-components/sc-select.js';

import layoutFull from './layouts/full.js';
import layoutTest from './layouts/test.js';

class App {
  constructor(audioContext, buffers, defaultScore) {
    this.audioContext = audioContext;
    this.buffers = buffers;
    this.layout = 'full';

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
    let inner = html`<h1>Coucou</h1>`;

    switch (this.layout) {
      case 'full': {
        inner = layoutFull(this);
        break;
      }
      case 'test': {
        inner = layoutTest(this);
        break;
      }
      default: {
        console.log(`layout ${this.layout} not implemented`);
        break;
      }
    }

    console.log(inner);

    render(html`
      <header>
        <sc-select
          .options=${['full', 'test']}
          @change=${e => {
            this.layout = e.detail.value;
            this.render();
          }}
        ></sc-select>
      </header>
      <h1>${inner}</h1>
    `, document.body)
  }
}

export default App;
