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

    // 'sine', 'drum', 'old-numerical', 'mechanical', 'drumstick'
    this.sonification = 'sine';
    // 'auto', 'double', 'beat', 'bar', 'odd', 'even'
    this.sonificationMode = 'auto';

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

  updateSonification(key, value) {
    this[key] = value;
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
          <img src="./assets/logo-200x200.png" />
          <h1>SO(a)P Metronome</h1>
          <a href="#" @click=${e => {
            e.preventDefault();
            renderDoc = !renderDoc;
            app.render();
          }}>Syntax documentation</a>
        </div>
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
      <h1>${inner}</h1>
    `, document.body)
  }
}

export default App;
