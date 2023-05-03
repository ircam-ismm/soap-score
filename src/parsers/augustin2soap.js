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

function sortEvents(events) {
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
  return events;
}

function _getEventAtLocation(bar, beat, events) {
  events = sortEvents(events);
  let event = null;

  for (let i = 0; i < events.length; i++) {
    event = events[i];

    if (events[i + 1]) {
      let next = events[i + 1];

      // break only if event is strictly after given location
      if (next.bar > bar || (next.bar === bar && next.beat > beat)) {
        break;
      }
    }
  }

  return event;
}

function getBarBeatFromDuration(bar, beat, duration, events) {

  const { signature: beginSignature, tempo } = _getEventAtLocation(bar, beat, events);
  // on calcule la durée dans l'unitée de départ
  const numBasisInBar = (beginSignature.upper / beginSignature.lower) / (tempo.basis.upper / tempo.basis.lower);
  const normRelBeat = duration / numBasisInBar;

  let remaining = Infinity;

  while (remaining > 1) {
    const normBeat = (beat - 1) / numBasisInBar;

    let nextNormBeat = normBeat + normRelBeat;
    if (Math.abs(Math.round(nextNormBeat) - nextNormBeat) < 1e-6) {
      nextNormBeat = Math.round(nextNormBeat);
    }

    bar += Math.floor(nextNormBeat);

    remaining = nextNormBeat - Math.floor(nextNormBeat);
    beat = remaining * numBasisInBar + 1;
  }

  const { signature } = _getEventAtLocation(bar, beat, events);

  return { bar, beat, signature };

}

function pushLineInEventList(events, lineEventList) {

  // find some tempo events
  lineEventList.forEach((line, index) => {

    const duration = line.duration;
    const startTempo = line.bpm.start;
    const endTempo = line.bpm.end;
    const tempoExponent = line.bpm.exponent;

    // need to compute REAL FIRST BEAT.
    // line.beat can be greater than signature.upper
    let { bar:startBar, beat:startBeat, signature:beginSignature } = getBarBeatFromDuration(line.bar, 1, (line.beat-1), events);

    let { bar:endBar, beat:endBeat, signature:endSignature } = getBarBeatFromDuration(startBar, startBeat, duration, events);

    endBeat = Math.round(endBeat*10)/10;
    startBeat = Math.round(startBeat*10)/10;

    // adding start curve event
    events.push({
      bar: startBar,
      beat: startBeat,
      signature: beginSignature,
      duration: null,
      tempo: {
        basis: TimeSignature.get(`1/${beginSignature.lower}`),
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
    // adding stop curve event
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

    if (index === 0) {
      // we need to add a simple element to the beginning of the bar
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
    // push line Event
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
    events = sortEvents(events);
    // console.log(events);
    const output = writeScore(events);
    return output;
  },
};

export default augustin2soap;


