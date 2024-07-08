import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { html, render, nothing } from 'lit';

import SoapScoreInterpreter from '@ircam/soap-score/SoapScoreInterpreter.js';
import '@ircam/sc-components/sc-select.js';

const layouts = ['default'];

class App {
  constructor(audioContext, buffers, defaultScore) {
    this.audioContext = audioContext;
    this.buffers = buffers;

    this.layout = 'default';
    this.renderAdvancedOptions = false;

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

  setLayout(layout) {
    this.layout = layout;
    this.render();
  }

  setScore(score) {
    this.transport.stop();
    this.score = score;
    this.interpreter = new SoapScoreInterpreter(score);
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
           <a
            href="https://github.com/ircam-ismm/soap-score/blob/main/docs/SYNTAX.md"
            target="_blank"
          >Syntax documentation</a>
        </div>
        <div style="font-size: 0;">
          <!-- <sc-select
            value=${this.layout}
            .options=${layouts}
            @change=${e => this.setLayout(e.detail.value)}
          ></sc-select> -->
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
      ${inner}
    `, document.body)
  }
}

export default App;
