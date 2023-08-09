import { render, html } from 'lit/html.js';
import JSON5 from 'json5';

import '@ircam/sc-components/sc-editor.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-radio.js';
import '@ircam/sc-components/sc-select.js';
import { isString } from '@ircam/sc-utils';

import * as parsers from '../../../src/soap-score-parser.js';
import * as fixtures from '../../../tests/fixtures.js';

const scores = {};
for (let name in fixtures) {
  if (name.endsWith('Score')) {
    scores[name] = fixtures[name];
  }
}

console.info('> self.crossOriginIsolated', self.crossOriginIsolated);

let textResult = null;

function update() {
  let parsed = null;
  const score = document.querySelector('sc-editor').value;
  const method = document.querySelector('sc-radio').value;

  try {
    parsed = parsers[method](score);
  } catch (err) {
    console.log(err);
    parsed = err.message;
  }

  if (isString(parsed)) {
    textResult = parsed;
  } else {
    textResult = JSON.stringify(parsed, null, 2);
  }

  renderScreen();
}

const defaultScore = `// most minimalistic metronome
BAR 1 [4/4] TEMPO [1/4]=60
`;

function renderScreen() {
  render(html`
    <div style="float: left; width: 50%; height: 100vh">
      <div style="display: flex; justify-content: space-between;">
        <sc-radio
          style="width: 70%;"
          orientation="horizontal"
          value="parseScore"
          .options=${['formatScore', 'getEventList', 'parseScore']}
          @change=${update}
        ></sc-radio>
        <sc-select
          style="width: 30%;"
          .options=${scores}
          @change=${e => {
            document.querySelector('sc-editor').value = e.detail.value;
            update();
          }}
        ></sc-select>
      </div>
      <sc-editor
        style="width: 100%; height: calc(100% - 30px)"
        value="${defaultScore}"
        @change="${update}"
      ></sc-editor>
    </div>

    <sc-text
      style="float: right; width: 50%; height: 100vh"
      style=""
      value="${textResult}"
    ></sc-text>

  `, document.body);
}

(async function main() {
  renderScreen();

  window.addEventListener('resize', () => renderScreen());
  // this does not work
  document.querySelector('sc-editor').focus();
  update();
}());
