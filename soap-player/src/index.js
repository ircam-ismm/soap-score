import "core-js/stable";
import "regenerator-runtime/runtime";
import { resumeAudioContext } from '@ircam/resume-audio-context';

import { Scheduler } from '@ircam/sc-scheduling';

import Application from './Application.js';

import SoapScoreInterpreter from '../../src/SoapScoreInterpreter.js';
import * as fixtures from '../../tests/fixtures.js';

const scoreList = {};
for (let name in fixtures) {
  if (name.endsWith('Score')) {
    scoreList[name] = fixtures[name];
  }
}

import { JZZ } from 'jzz';

console.info('> self.crossOriginIsolated', self.crossOriginIsolated);

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const getTimeFunction = () => audioContext.currentTime;
const scheduler = new Scheduler(getTimeFunction);

let defaultScore = `\
BAR 1 [4/4] TEMPO [1/7]=120 \
`;

const searchParams = new URLSearchParams(window.location.search);

if (searchParams.has('score')) {
  defaultScore = decodeURIComponent(searchParams.get('score'));
}

(async function main() {
  await resumeAudioContext(audioContext);

  const res = await fetch('./SYNTAX.md');
  const syntaxDoc = await res.text();

  const application = new Application(audioContext, getTimeFunction, scheduler, defaultScore, scoreList, syntaxDoc);

  JZZ.requestMIDIAccess().then((webmidi) => {
    application.midiAccessIsSuccess(webmidi);
  }, () => {
    application.midiAccessIsFailed();
  });
  JZZ.close();

}());


// document.body.addEventListener('keypress', e => {
//   // console.log(e);
//   if (e.key == "Enter" || e.code == "Enter" || e.keyCode == 13) {
//     const now = getTime();
//     e.preventDefault();

//     transport.seek(now, 0);
//     this.model.seekBarBeat.bar = 1;
//     this.model.seekBarBeat.beat = 1;
//   }

//   if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
//     e.preventDefault();

//     console.log('coucou 22');

//     const now = getTime();

//     switch (this.model.transportState) {
//       case "play":
//         // need to stop
//         const { bar, beat } = this.model.seekBarBeat;
//         const pos = this.soapEngine.interpreter.getPositionAtLocation(bar, beat);
//         transport.pause(now);
//         transport.seek(now, pos);
//         this.model.transportState = "stop";
//         break;
//       case "stop":
//         // need to play
//         transport.play(now);
//         this.model.transportState = "play";
//         break;
//     }
//     renderScreen(this.model);
//   }
// });
