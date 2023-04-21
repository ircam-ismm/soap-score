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

function getBarBeatFromDuration(events, bar = 1, beat = 1, duration, signature, basis) {

  // on calcule la durée dans l'unitée de départ - donc à faire une seule fois
  const numQuarterNoteInBar = (signature.upper / signature.lower) / (basis.upper / basis.lower);
  const normRelBeat = duration / numQuarterNoteInBar;

  events.every((event ,index) => {

    const normBeat = (beat - 1) / numQuarterNoteInBar;
    let nextNormBeat = normBeat + normRelBeat;

    if (Math.abs(Math.round(nextNormBeat) - nextNormBeat) < 1e-6) {
      nextNormBeat = Math.round(nextNormBeat);
    }

    bar += Math.floor(nextNormBeat);

    const remaining = nextNormBeat - Math.floor(nextNormBeat);
    beat = remaining * numQuarterNoteInBar + 1;

    console.log("___________________________");
    console.log(`event ${event.bar}|${event.beat}`);
    console.log(`numQuarterNoteInBar ${numQuarterNoteInBar}`);
    console.log(`normRelBeat ${normRelBeat}`);
    console.log('normBeat', normBeat);
    console.log('nextNormBeat', nextNormBeat);
    console.log('remaining', remaining);
    console.log('bar', bar);
    console.log('beat', beat);
    console.log("event", event);
    if (remaining < 1) {
      return false;
    } else {
      return true;
    }
    signature = event.signature;
  });
  // console.log("bar", bar, "beat", beat);
  return { bar, beat, signature };
}

function pushLineInEventList(events, lineEventList) {

  // find some tempo events
  lineEventList.forEach((line, index) => {


    const duration = line.duration;
    const signature = line.signature;
    const basis = TimeSignature.get(`1/${signature.lower}`);
    let firstBeat;
    const startTempo = line.bpm.start;
    const endTempo = line.bpm.end;
    const tempoExponent = line.bpm.exponent;

    // need to compute REAL FIRST BEAT.
    // line.beat can be greater than signature.upper
    const { bar:startBar, beat:startBeat } = getBarBeatFromDuration(events, line.bar, 1, (line.beat-1), signature, basis);
    // console.log("line.bar", line.bar);
    // console.log("line.beat", line.beat);
    // console.log("startBar", startBar);
    // console.log("startBeat", startBeat);

    const { bar:endBar, beat:endBeat, signature:endSignature } = getBarBeatFromDuration(events, startBar, startBeat, duration, signature, basis);

    // console.log("______");
    // console.log("startBar", startBar);
    // console.log("startBeat", startBeat);
    // console.log("endBar", endBar);
    // console.log("endBeat", endBeat);
    // console.log("duration", duration);
    // console.log("endSignature", endSignature);


    if (startBar === line.bar && startBeat === 1) {
      firstBeat = true;
    } else {
      firstBeat = false;
    }
    // if tempo curve is not on a firstBeat, need to add a simpleElement on firstBeat
    // if line.bar !== startBar, need to add an element on bar, because signature AND tempo will be applied on line.bar in every case
    if (!firstBeat) {
      // we're not on first beat
      // so we need to add an element on first beat with tempo and signature
      events.push({
        bar: line.bar,
        beat: 1,
        signature: signature,
        duration: null,
        tempo: {
          basis: TimeSignature.get(`1/${signature.lower}`),
          bpm: startTempo,
          curve: null,
        },
        fermata: null,
        label: null,
      });
      // now, we need to add an element on startBeat for curve event.
      events.push({
        bar: startBar,
        beat: startBeat,
        signature: signature,
        duration: null,
        tempo: {
          basis: TimeSignature.get(`1/${signature.lower}`),
          bpm: null,
          curve: {
            start: {
              bar: startBar,
              beat: startBeat,
              bpm: startTempo,
            },
            end: {
              bar: endBar,
              beat: endBeat,
              bpm: endTempo,
            },
            exponent: tempoExponent,
          },
        },
        fermata: null,
        label: null,
      });
    } else {
      // we're on first beat !
      // so we can add curve event right now
      events.push({
        bar: startBar,
        beat: startBeat,
        signature: signature,
        duration: null,
        tempo: {
          basis: TimeSignature.get(`1/${signature.lower}`),
          bpm: null,
          curve: {
            start: {
              bar: startBar,
              beat: startBeat,
              bpm: startTempo,
            },
            end: {
              bar: endBar,
              beat: endBeat,
              bpm: endTempo,
            },
            exponent: tempoExponent,
          },
        },
        fermata: null,
        label: null,
      });
    }

  // now we need a add an event on endBar endBeat with tempo curve null.
  events.push({
    bar: endBar,
    beat: endBeat,
    signature: endSignature,
    duration: null,
    tempo: {
      basis: TimeSignature.get(`1/${endSignature.lower}`),
      bpm: endTempo,
      curve: null,
    },
    fermata: null,
    label: null,
  });

  });
  return events;
}

function curveParsing(line) {
  let lineEventList = [];
  const bar = parseInt(line[0]) + 1;
  line.shift();
  const signature = TimeSignature.get(line[0]);
  line.shift();
  if (line.length === 3) {
    line.push('1');
  }
  line = chunk(line,4);
  // console.log(line);
  line.forEach(curve => {
    // curve[0] is tempo of begin - curve[1] tempo of end - curve[2] duration (with basis of {startBar, startBeat}) - curve[3] first beat to start
    const beginTempo = parseFloat(curve[0]);
    const endTempo = parseFloat(curve[1]);
    const curveDuration = parseFloat(curve[2]);
    const beat = parseFloat(curve[3]);

    // console.log(curve);
    // please note :
    // beat can be greater than Signature...
    // eg : 18, 3/4 120 80.5 3 4

    lineEventList.push({
      bar: bar,
      beat: beat,
      signature: signature,
      duration: curveDuration,
      bpm: {
        start: beginTempo,
        end: endTempo,
        exponent: 1,
      }
    });
  });
  return lineEventList;
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
    let lineEventList = [];
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
            lineEventList.push(e);
          });
          break
      }
    });

    events = pushLineInEventList(events, lineEventList);
    // console.log(events);
    const output = writeScore(events);
    return output;
  },
};

export default augustin2soap;


