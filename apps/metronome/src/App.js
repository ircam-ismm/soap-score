import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { html, render } from 'lit';

import SoapScoreInterpreter from '../../../src/SoapScoreInterpreter.js';

// import SoapProcessor from './processors/SoapProcessor.js';

import '@ircam/sc-components/sc-select.js';

const layouts = ['mobile', 'full', 'test']

class App {
  constructor(audioContext, buffers, defaultScore) {
    this.audioContext = audioContext;
    this.buffers = buffers;
    this.layout = 'mobile';

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
  async render() {
    const mod = await import(`./layouts/${this.layout}.js`);
    const layout = mod.default;
    const inner = layout(this);

    render(html`
      <header>
        <div>
          <sc-select
            .options=${layouts}
            @change=${e => {
              this.layout = e.detail.value;
              this.render();
            }}
          ></sc-select>
        </div>
        <div style="font-size: 0;">
          <sc-icon
            type="burger"
            @input=${e => {
              renderAdvancedOptions = !renderAdvancedOptions;
              app.render();
            }}
          ></sc-icon>
          <sc-fullscreen></sc-fullscreen>
        </div>
      </header>
      <h1>${inner}</h1>
    `, document.body)
  }
}

export default App;
