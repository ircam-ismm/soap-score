import fs from 'node:fs';
import path from 'node:path';

import chunk from 'lodash.chunk';

import TimeSignature from '@tonaljs/time-signature';

import parseDuration from 'parse-duration';

import { writeScore } from '../soap-score-writer.js';

// ----------------------------------------------------------
// helpers
// ----------------------------------------------------------
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

function curveParsing(line) {
  line.pop();
  const bar = parseInt(line[0]);
  const signature = TimeSignature.get(line[1]);
  line.shift();
  line.shift();
  if (line.length === 3) {
    line.push('1');
  }
  line = chunk(line,4);
  console.log("end",line);
// si on a ça
  // sig, tempoBegin, tempoEnd, timeToInterpolate
// ajoute 1
// si on a ça
  // sig, tempoBegin, tempoEnd, timeToInterpolate, firstInterpolationTime
// niquel
// si on a ça
  // sig, tempoBegin, tempoEnd, timeToInterpolate, firstInterpolationTime, [tempoBegin, tempo...]
// divise en triplet

}

function simpleParsing(line) {
  let events = null;
  const command = line[1];
  const bar = parseInt(line[0]);
  switch (command) {
    case 'fermata':
      events = {
        bar: bar,
        beat: 1,
        signature: TimeSignature.get('4/4'),
        duration: null,
        tempo: null,
        fermata: {
          basis: TimeSignature.get('1/1'),
          absDuration: null,
          relDuration: null,
          suspended: true,
        },
        label: null,
      };
      break;
    case 'timer':
      const timer = parseTime(line[2]);
      if (timer !== null) {
        events = {
          bar: bar,
          beat: 1,
          duration: timer,
          signature: null,
          tempo: null,
          fermata: null,
          label: null,
        };
      } else {
        console.log("cannot parse ", line);
      };
      break;
    default:
      let tempo = null;
      const signature = TimeSignature.get(line[1]);
      let bpm = null;
      let basis = null;
      if (line[2]) {
        tempo = { basis: null, bpm: null, curve: null };
        tempo.bpm = parseFloat(line[2]);
        tempo.basis = TimeSignature.get(`1/${signature.lower}`);
      };
      events = {
        bar: bar,
        beat: 1,
        signature: signature,
        tempo: tempo,
        fermata: null,
        label: null,
      };
      break;
  };
  return events;
};

// ----------------------------------------------------------
// MAIN
// ----------------------------------------------------------

const augustin2soap = {
  fromFile: (input, output) => {
    if (!fs.existsSync(input)) {
      throw new Error(`coucou`);
    }

    const score = fs.readFileSync(input).toString();
    const soapScore = this.parse(score);

    fs.writeFileSync(output, soapScore);
  },

  parse: (data) => {

    // parsing array from txt
    data = data.split("\n");
    let array = [];
    let events = [];

    data.forEach(line => {
      line = line.replace(",", "");
      line = line.replace(";", "");
      array.push((line.split(" ")));
    });

    array.forEach(line => {
      switch (line.length) {
        case 0:
          break;
        case 1:
          break;
        case 2:
          events.push(simpleParsing(line));
          break;
        case 3:
          events.push(simpleParsing(line));
          break;
        default:
          events.push(curveParsing(line));
          break
      }
    });
    console.log(events);
    const output = writeScore(events);
    return output;
  },
};

export default augustin2soap;


