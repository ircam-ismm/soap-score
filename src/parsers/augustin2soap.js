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

function getBarBeatFromDuration(events, bar, beat, duration, signature, basis) {
  // on calcule la durée dans l'unitée de départ - donc à faire une seule fois
  const numBasisInBar = (signature.upper / signature.lower) / (basis.upper / basis.lower);
  const normRelBeat = duration / numBasisInBar;

  events.every((event ,index) => {
    if (bar > event.bar && events[index+1]) {
      // console.log(`gotonext this is next ${events[index+1].bar}|${events[index+1].beat}`);
      // signature = event.signature;
      return true;
    } else {
      // console.log(`event bar is ${event.bar}|${event.beat} - computed bar is ${bar}|${beat}`);
    }

    const numBasisInBar = (signature.upper / signature.lower) / (basis.upper / basis.lower);
    // a bar is 1, so 1er temps d'un 4/4 est 0, le 2nd est 0.25, 3e 0.5, 4e 0.75
    const normBeat = (beat - 1) / numBasisInBar;
    //
    let nextNormBeat = normBeat + normRelBeat;

    // handle erreur d'arrondi
    if (Math.abs(Math.round(nextNormBeat) - nextNormBeat) < 1e-6) {
      nextNormBeat = Math.round(nextNormBeat);
    }

    bar += Math.floor(nextNormBeat);

    const remaining = nextNormBeat - Math.floor(nextNormBeat);
    beat = remaining * numBasisInBar + 1;

    // console.log("___________________________");
    // console.log(`event ${event.bar}|${event.beat}`);
    // console.log(`numBasisInBar ${numBasisInBar}`);
    // console.log(`normRelBeat ${normRelBeat}`);
    // console.log('normBeat', normBeat);
    // console.log('nextNormBeat', nextNormBeat);
    // console.log('remaining', remaining);
    // console.log('bar', bar);
    // console.log('beat', beat);
    // console.log("event", event);
    if (remaining < 1) {
      // console.log("__________");
      // console.log("end of trip");
      // console.log(`position ${bar}|${beat}`);
      // console.log(`current event in loop ${event.bar}|${event.beat} with ${event.signature.upper}/${event.signature.lower}`);
      // console.log(`signature at position is ${signature.upper}/${signature.lower}`);
      if (events[index + 1] && remaining === 0) {
        signature = events[index + 1].signature;
        // console.log(`next event in loop ${events[index+1].bar}|${events[index+1].beat} with signature ${events[index+1].signature.upper}/${events[index+1].signature.lower}`);

      }
      // console.log("__________");

      return false;
    } else {
      // console.log(signature);
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
    let { bar:startBar, beat:startBeat } = getBarBeatFromDuration(events, line.bar, 1, (line.beat-1), signature, basis);

    let { bar:endBar, beat:endBeat, signature:endSignature } = getBarBeatFromDuration(events, startBar, startBeat, duration, signature, basis);

    endBeat = Math.round(endBeat*10)/10;
    startBeat = Math.round(startBeat*10)/10;

    // console.log("______");
    // // console.log("line.bar", line.bar);
    // // console.log("line.beat", line.beat);
    // console.log("startBar", startBar);
    // console.log("startBeat", startBeat);
    // console.log("startTempo", startTempo);
    // console.log("endBar", endBar);
    // console.log("endBeat", endBeat);
    // console.log("endTempo", endTempo);
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
      // we need to add an element on startBeat for curve event.
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
    // (only if it is the last event of the line list) -> ?!?
    events.push({
      pouet:"toto",
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
  let events = [];
  //remove ";"
  if (line[line.length-1] === '') {
    line.pop();
  }
  // console.log(line);
  const bar = parseInt(line[0]) + 1;
  line.shift();
  const signature = TimeSignature.get(line[0]);
  line.shift();
  if (line.length === 3) {
    line.push('1');
  }
  line = chunk(line,4);

  // console.log(line);
  line.forEach((curve, index) => {
    // curve[0] is tempo of begin - curve[1] tempo of end - curve[2] duration (with basis of {startBar, startBeat}) - curve[3] first beat to start
    const beginTempo = parseFloat(curve[0]);
    const endTempo = parseFloat(curve[1]);
    const beat = parseFloat(curve[3]);
    const curveDuration = parseFloat(curve[2]);

    if (beat !== 1 && index === 0) {
      // we're not on first beat, we need to add a simple element to the beginning of the bar -
      // we need to do that only if it is the first element to push!
      events.push({
        bar: bar,
        beat: 1,
        signature: signature,
        duration: null,
        tempo: {
          basis: TimeSignature.get(`1/${signature.lower}`),
          bpm: beginTempo,
          curve: null,
        },
        fermata: null,
        label: null,
      });
    }

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
  return { lineEventList, events };
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
          {
          const el = simpleParsing(line);
          el.forEach(e => {
            events.push(e);
          });
          };
          break;
        case 3: {
          const el = simpleParsing(line);
          el.forEach(e => {
            events.push(e);
          });
          };
          break;
        default:
          {
          const { lineEventList: lineEl, events: el } = curveParsing(line);
          // little additional list of curve events (will be parsed at the end
          // by pushLineInEventList() function)
          lineEl.forEach(e => {
            lineEventList.push(e);
          });
          // list of simple events extracted from curveParsing
          el.forEach(e => {
            events.push(e);
          })
          };
          break;
      }
    });

    events = pushLineInEventList(events, lineEventList);
    events.sort((a, b) => {
      if (a.bar < b.bar) {
        return -1;
      } else if (a.bar > b.bar) {
        return 1;
      } else {
        if (a.beat < b.beat) {
          return -1;
        } else if (a.beat > b.beat) {
          return 1;
        } else {
          // console.log("same event, MERGE");
        }
      }
    });
    // console.log(events);
    const output = writeScore(events);
    return output;
  },
};

export default augustin2soap;


