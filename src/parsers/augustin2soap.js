// import fs from 'node:fs';
// import path from 'node:path';

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

function shiftMeasure(events, shift) {
  events.forEach(e => {
    e.bar += shift
  })
  return events;
}

function computeEndCurveLocation(events) {

  let signature = events[0].signature;

  events.forEach((event, index) => {
    // console.log(signature);
    // console.log(event)

    // console.log(`${signature.upper}/${signature.lower}`);

    if (event.tempo && event.tempo.curve) {
      // const basis = event.tempo.basis;
      // const basisRatio = basis.upper / basis.lower;
      const relBeat = event.tempo.curve.duration;

      let bar = event.tempo.curve.start.bar;
      let beat = event.tempo.curve.start.beat;

      // for (i = index)


      beat += relBeat;

      if (beat > event.signature.upper) {
        let numBar = 0;
        while (beat > event.signature.upper) {
          beat -= signature.upper;
          bar += 1;
        }
        beat = relBeat % event.signature.upper;
        bar += Math.floor((relBeat - beat) / event.signature.upper);
        console.log('switch', bar, beat);
        beat -= event.signature.upper;
      }

      event.tempo.curve.end.bar = bar;
      event.tempo.curve.end.beat = beat;




      // console.log(event.bar, event.beat);
      console.log(event.tempo);
    };
    // console.log("avant", signature.upper, event.signature.upper);
    signature = event.signature;
    // console.log("après", signature.upper, event.signature.upper);

  });
  return events;
}

function curveParsing(line) {
  let e = [];
  line.pop();
  const bar = parseInt(line[0]) + 1;
  const signature = TimeSignature.get(line[1]);
  line.shift();
  line.shift();
  if (line.length === 3) {
    line.push('1');
  }
  line = chunk(line,4);
  // console.log(line);
  line.forEach(curve => {
    // curve[0] is tempo of begin - curve[1] tempo of end - curve[2] duration - curve[3] first beat to start
    const beginTempo = parseFloat(curve[0]);
    const endTempo = parseFloat(curve[1]);
    const curveDuration = parseFloat(curve[2]);
    const beat = parseFloat(curve[3]);
    e.push({
      bar: bar,
      beat: 1,
      signature: signature,
      duration: null,
      tempo: {
        basis: TimeSignature.get(`1/${signature.lower}`),
        bpm: null,
        curve: {
          start: {
            bar: bar,
            beat: beat,
            bpm: beginTempo,
          },
          end: {
            bar: null,
            beat: null,
            bpm: endTempo,
          },
          duration: curveDuration,
        },
      },
      fermata: null,
      label: null,
    });
  });
  return e;
};

function simpleParsing(line) {
  let e = [];
  const command = line[1];
  // this is for consistency with other scores !
  const bar = parseInt(line[0]) + 1;
  switch (command) {
    case 'fermata':
      e.push({
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
      });
      break;
    case 'timer':
      const timer = parseTime(line[2]);
      if (timer !== null) {
        e.push({
          bar: bar,
          beat: 1,
          duration: timer,
          signature: null,
          tempo: null,
          fermata: null,
          label: null,
        });
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
      e.push({
        bar: bar,
        beat: 1,
        signature: signature,
        tempo: tempo,
        fermata: null,
        label: null,
      });
      break;
  };
  return e;
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

  readString: (input) => {
    const score = input.toString();

  },

  parse: (data) => {

    // parsing array from txt
    data = data.split("\n");
    let array = [];
    let events = [];
    let el = null;

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
          el = simpleParsing(line);
          el.forEach(e => {
            events.push(e);
          });
          break;
        case 3:
          el = simpleParsing(line);
          el.forEach(e => {
            events.push(e);
          });
          break;
        default:
          el = curveParsing(line);
          el.forEach(e => {
            events.push(e);
          });
          break
      }
    });

    // console.log(events.tempo);
    events = computeEndCurveLocation(events);
    const output = writeScore(events);
    return output;
  },
};

export default augustin2soap;


