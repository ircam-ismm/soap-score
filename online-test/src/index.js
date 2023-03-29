import "core-js/stable";
import "regenerator-runtime/runtime";
import { render, html } from 'lit/html.js';
import JSON5 from 'json5';

import '@ircam/simple-components/sc-editor.js';
import '@ircam/simple-components/sc-text.js';

import { getEventList, parseScore } from '../../src/soap-score-parser.js';


console.info('> self.crossOriginIsolated', self.crossOriginIsolated);

let res = null;

function parseAndShowScore(code) {
  res = null;

  try {
    res = parseScore(code);
    console.log(res);
  } catch (err) {
    console.log(err);
    res = err.message;
  }

  renderScreen();
}

const defaultScore = `// most minimalistic metronome
BAR [4/4] TEMPO [1/4]=60
`;

function renderScreen() {
  const width = window.innerWidth / 2;
  const height = window.innerWidth;

  render(html`
    <sc-editor
      width="${width}"
      height="${height}"
      style="float: left"
      value="${defaultScore}"
      @change="${e => parseAndShowScore(e.detail.value)}"
    ></sc-editor>

    <sc-text
      width="${width}"
      height="${height}"
      style="float: left"
      value="${JSON5.stringify(res, null, 2)}"
    ></sc-text>

  `, document.body);
}

(async function main() {
  renderScreen();

  window.addEventListener('resize', () => renderScreen());
  // this does not work
  document.querySelector('sc-editor').focus();
}());
