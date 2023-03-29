import fs from 'node:fs';

import TimeSignature from '@tonaljs/time-signature';
// import chunk from 'lodash.chunk';

import { getEventList } from '../src/soap-score-parser.js';
import { checkSoapEvent } from '../src/check-soap-events.js';

const inputFilename = process.argv.slice(2);
const strInputFileName = `./${inputFilename[0]}`
const outputFileName = `${inputFilename[0].slice(0,-4)}.soap`;
console.log('parsing ', strInputFileName, ' and saving into ', outputFileName);

// functions helpers

function parseTime(str) {
  let time = 0;

  if ( !isNaN(str) ) {
    time = parseFloat(str)/1000;
  } else {
    const a = str.split(':');

    if (a.length !== 2) {
      time = null;
    } else {
      time = (+a[0]) * 60 + (+a[1]);
    }
  }

  return time;
}


// MAIN

const data = fs.readFileSync(strInputFileName,{encoding:'utf8', flag:'r'});
const dataArray = data.split("\n");
const cleanArray = [];
let events = [];
let index = 0;
const cmd = ['fermata', 'timer'];
const endCurvePositionArray = [];

dataArray.forEach(line => {
  line = line.replace(",", "");
  line = line.replace(";", "");
  cleanArray.push((line.split(" ")));
});

cleanArray.forEach(line => {
  switch (line.length) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      simpleParsing(line);
      break;
    case 3:
      simpleParsing(line);
      break;
    default:
      curveParsing(line);
      break
  }
});
console.log(events);

function simpleParsing(line) {
  const command = line[1];
  const bar = parseInt(line[0]);
  switch (command) {
    case 'fermata':
      events.push( {
        bar: bar,
        beat: 1,
        signature: null,
        basis: null,
        bpm: null,
        bpmCurve: null,
        fermata: +Infinity,
        label: null,
      } );
      break;
    case 'timer':
      const timer = parseTime(line[2]);
      if (timer !== null) {
        events.push( {
          bar: bar,
          beat: 1,
          signature: null,
          basis: null,
          bpm: null,
          bpmCurve: null,
          fermata: timer,
          label: null,
        } );
      } else {
        console.log("cannot parse ", line);
      };
      break;
    default:
      const signature = TimeSignature.get(line[1]);
      let bpm = null;
      let basis = null;
      if (line[2]) {
        bpm = parseFloat(line[2]);
        basis = TimeSignature.get(`1/${signature.lower}`);
      } else {
        bpm = null;
        basis = null;
      };
      events.push( {
        bar: bar,
        beat: 1,
        signature: signature,
        basis: basis,
        bpm: bpm,
        bpmCurve: null,
        fermata: null,
        label: null,
      });
  };
};

function curveParsing(line) {
  const bar = parseInt(line[0]);
  const signature = TimeSignature.get(line[1]);
// si on a ça
  // sig, tempoBegin, tempoEnd, timeToInterpolate
// ajoute 1
// si on a ça
  // sig, tempoBegin, tempoEnd, timeToInterpolate, firstInterpolationTime
// niquel
// si on a ça
  // sig, tempoBegin, tempoEnd, timeToInterpolate, firstInterpolationTime, [tempoBegin, tempo...]
// divise en triplet
  switch (line.length) {
    case 3:

  }
  console.log(line);
}
