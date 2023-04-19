import "core-js/stable";
import "regenerator-runtime/runtime";
import { resumeAudioContext } from '@ircam/resume-audio-context';

import { Scheduler, Transport } from '@ircam/sc-scheduling';

import SoapScoreInterpreter from '../../src/SoapScoreInterpreter.js';
import * as fixtures from '../../tests/fixtures.js';

import { renderScreen } from './view.js';
import SoapEngine from './SoapEngine.js';

const scores = {};
for (let name in fixtures) {
  if (name.endsWith('Score')) {
    scores[name] = fixtures[name];
  }
}

console.info('> self.crossOriginIsolated', self.crossOriginIsolated);

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const getTime = () => audioContext.currentTime;
const scheduler = new Scheduler(getTime);
const transport = new Transport(scheduler);

const defaultScore = `\
BAR 1 [4/4] "section 1" TEMPO [1/4]=120
BAR 3 [4/4] "section 2" TEMPO [1/4]=60
`;

// model
const viewState = {
  transport: transport,
  score: defaultScore,
  soapEngine: null,
  active: false,
  scores: scores,
  getTime: getTime,
  setScore: setScore,
  jumpToLabel: jumpToLabel,
  transportState: 'stop',
  seekBarBeat: {
    bar: 1,
    beat: 1,
  },
  loopState: {
    start: {
      bar: 1,
      beat: 1,
    },
    end: {
      bar: 2,
      beat: 1,
    },
  },
};

function setScore(newScore) {
  // reset transport
  const now = getTime();
  transport.pause(now);
  transport.seek(now, 0);

  if (transport.has(viewState.soapEngine)) {
    transport.remove(viewState.soapEngine);
  }

  const soapEngine = new SoapEngine(newScore, viewState, audioContext);
  transport.add(soapEngine);

  viewState.score = newScore;
  viewState.soapEngine = soapEngine;

  viewState.transportState = 'stop';

  {
    const { bar, beat } = viewState.loopState.start;
    transport.loopStart = soapEngine.interpreter.getPositionAtLocation(bar, beat);
  }

  {
    const { bar, beat } = viewState.loopState.end;
    transport.loopEnd = soapEngine.interpreter.getPositionAtLocation(bar, beat);
  }

  renderScreen(viewState);
}

function jumpToLabel(label) {
  const now = getTime();
  const position = viewState.soapEngine.interpreter.getPositionAtLabel(label);
  // console.log('Jump to label', label, position);

  transport.pause(now);
  transport.seek(now, position);

  viewState.transportState = 'stop';

  renderScreen(viewState);
}


(async function main() {
  await resumeAudioContext(audioContext);
  setScore(defaultScore);
}());


document.body.addEventListener('keypress', e => {
  // console.log(e);
  // if (e.key == "Enter" || e.code == "Enter" || e.keyCode == 13) {
  //   const now = getTime();
  //   e.preventDefault();

  //   transport.seek(now, 0);
  //   viewState.seekBarBeat.bar = 1;
  //   viewState.seekBarBeat.beat = 1;

  // }

  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    const now = getTime();
    e.preventDefault();

    switch (viewState.transportState) {
      case "play":
        // need to stop
        const { bar, beat } = viewState.seekBarBeat;
        const pos = viewState.soapEngine.interpreter.getPositionAtLocation(bar, beat);
        transport.pause(now);
        transport.seek(now, pos);
        viewState.transportState = "stop";
        break;
      case "stop":
        // need to play
        transport.play(now);
        viewState.transportState = "play";
        break;
    }
    renderScreen(viewState);
  }
});
