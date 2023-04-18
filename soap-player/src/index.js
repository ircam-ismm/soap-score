import "core-js/stable";
import "regenerator-runtime/runtime";
import { resumeAudioContext } from '@ircam/resume-audio-context';

import { Scheduler, Transport } from '@ircam/sc-scheduling';

import '@ircam/simple-components/sc-bang.js';
import '@ircam/simple-components/sc-transport.js';
import '@ircam/simple-components/sc-number.js';
import '@ircam/simple-components/sc-editor.js';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-slider.js';
import './sc-clock.js';

import SoapScoreInterpreter from '../../src/SoapScoreInterpreter.js';
import * as fixtures from '../../tests/fixtures.js';

import { renderScreen } from './view.js';
import { SoapEngine } from './SoapEngine.js';

const scores = {};
for (let name in fixtures) {
  if (name.endsWith('Score')) {
    scores[name] = fixtures[name];
  }
}
// console.log(scores);

console.info('> self.crossOriginIsolated', self.crossOriginIsolated);

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const getTime = () => audioContext.currentTime;
const scheduler = new Scheduler(getTime);
const transport = new Transport(scheduler);

let score = `\
BAR 1 [4/4] "section 1" TEMPO [1/4]=120
BAR 3 [4/4] "section 2" TEMPO [1/4]=60
`;

let soapEngine = null;
const viewState = {
  transport: transport,
  score: score,
  soapEngine: null,
  active: false,
  scores: scores,
  getTime: getTime,
  setScore: setScore,
  jumpToLabel: jumpToLabel
};

function setScore(newScore) {
  console.log(newScore);
  score = newScore;

  // reset transport
  const now = getTime();
  transport.pause(now);
  transport.seek(now, 0);

  if (transport.has(soapEngine)) {
    transport.remove(soapEngine);
  }

  soapEngine = new SoapEngine(score, viewState, audioContext);
  transport.add(soapEngine);

  viewState.score = newScore;
  viewState.soapEngine = soapEngine;

  renderScreen(viewState);
}

function jumpToLabel(label) {
  const now = getTime();
  const position = soapEngine.interpreter.getPositionAtLabel(label);
  // console.log('Jump to label', label, position);

  transport.pause(now);
  transport.seek(now, position);

  renderScreen(viewState);
}


(async function main() {
  await resumeAudioContext(audioContext);
  setScore(score);
}());
