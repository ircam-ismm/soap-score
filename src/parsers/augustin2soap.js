import chunk from 'lodash.chunk';

import {
  barSignature,
  tempoBasisSignature,
} from '../utils/time-signatures.js';

import { writeScore } from '../soap-score-writer.js';
import { parseScore } from '../soap-score-parser.js';

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
    if (events[i].signature || events[i].tempo) {
      event = events[i];
    } else {
      // console.log("event is ignored because no tempo or no signature");
    }

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
  // console.log(beginSignature);
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
    let {
      bar: startBar,
      beat: startBeat,
      signature: beginSignature
    } = getBarBeatFromDuration(line.bar, 1, line.beat - 1, events);

    let {
      bar: endBar,
      beat: endBeat,
      signature: endSignature
    } = getBarBeatFromDuration(startBar, startBeat, duration, events);

    events.forEach((e) => {
      if (e.bar === endBar && e.beat === endBeat && e.tempo) {
        const newEndPos = getBarBeatFromDuration(endBar, endBeat, -0.01, events);
        endBar = newEndPos.bar;
        endBeat = newEndPos.beat;
        endSignature = newEndPos.signature;
      }
    });

    endBeat = Math.round(endBeat*100)/100;
    startBeat = Math.round(startBeat*100)/100;

    // add start curve event
    events.push({
      bar: startBar,
      beat: startBeat,
      signature: beginSignature,
      duration: null,
      tempo: {
        basis: tempoBasisSignature(`[1/${beginSignature.lower}]`),
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

    // add stop curve event
    events.push({
      bar: endBar,
      beat: endBeat,
      signature: endSignature,
      duration: null,
      tempo: {
        basis: tempoBasisSignature(`[1/${endSignature.lower}]`),
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

  // console.log(line);
  const bar = parseInt(line[0]);
  line.shift();

  const signature = barSignature(`[${line[0]}]`);
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
          basis: tempoBasisSignature(`[1/${signature.lower}]`),
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
  const e = [];
  const command = line[1];
  const bar = parseInt(line[0]);

  switch (command) {
    case 'fermata':
      e.push({
        bar: bar,
        beat: 1,
        signature: barSignature('[4/4]'),
        duration: null,
        tempo: null,
        fermata: {
          basis: tempoBasisSignature('[1/1]'),
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
    case 'label':
      const label = line.pop();

      e.push({
        bar: bar,
        beat: 1,
        duration: null,
        signature: null,
        tempo: null,
        fermata: null,
        label: label,
      });
      break;
    case 'end':
      break;
    default:
      const signature = barSignature(`[${line[1]}]`);
      let tempo = null;
      let bpm = null;
      let basis = null;

      if (line[2]) {
        tempo = { basis: null, bpm: null, curve: null };
        tempo.bpm = parseFloat(line[2]);
        tempo.basis = tempoBasisSignature(`[1/${signature.lower}]`);
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
  fromFile(input, output) {
    if (!fs.existsSync(input)) {
      throw new Error(`coucou`);
    }

    const score = fs.readFileSync(input).toString();
    const soapScore = this.parse(score);

    fs.writeFileSync(output, soapScore);
  },

  readString(data, name) {
    let soapScore = this.parse(data);
    soapScore = `// ${name}${soapScore}`;
    return soapScore;
  },

  parse(data) {
    // parsing array from txt
    data = data.split("\n");
    let array = [];
    let events = [];
    let lineEventList = [];
    let label = [];

    data.forEach(line => {
      // here line is string
      line = line.replace(",", "");
      line = line.replace(";", "");
      line = line.replace("\r", "");
      // here line is list
      line = line.split(" ");
      // remove empty caracter at end of line
      if (line[line.length-1] === "") {
        line.pop();
      }
      // parse labels
      if (line[0] === "#") {
        line.shift();
        label = line;
      } else {
        array.push(line);
        if (label.length !== 0) {
          const strLabel = label.join(" ");
          array.push([line[0], 'label', strLabel]);
          label = [];
        }
      }
    });

    // FILTER BAR 0
    array.forEach((line, index) => {
      if (line[0] === "0") {
        array.splice(index, 1);
      }
    });

    array.forEach((line, index) => {
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
    // normalize score before tempo curve

    // console.log(events);
    events = pushLineInEventList(events, lineEventList);
    // console.log(events);
    // sort events
    events = sortEvents(events);
    // normalize score after tempo curve
    // console.log(events);

    events = parseScore(writeScore(events));
    const output = writeScore(events);
    // console.log(output);
    return output;
  },
};

export default augustin2soap;


