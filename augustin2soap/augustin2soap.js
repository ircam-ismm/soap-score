import fs from 'node:fs';

import TimeSignature from '@tonaljs/time-signature';
import chunk from 'lodash.chunk';

import { soapScoreEventParser } from '../src/soap-score-parser.js';

const inputFilename = process.argv.slice(2);
const strInputFileName = `./${inputFilename[0]}`
const outputFileName = `${inputFilename[0].slice(0,-4)}.soap`;
console.log('parsing ', strInputFileName, ' and saving into ', outputFileName);

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

function addTempoEvent(bar, beat, tempo, curve=null) {
  const tempoEventAtSameLocation = events.find(e => {
    return e.type === "TEMPO" && e.bar === bar && e.beat === beat;
  });

  const indexTempoEventAtSameLocation = events.findIndex(e => {
    return e === tempoEventAtSameLocation
  });

  if (tempoEventAtSameLocation !== undefined) {
    // si l'évenement que je veux créer a une curve et que celui qui existe n'en a pas
    if (tempoEventAtSameLocation.curve !== null) {
      if (curve !== null) {
        console.log("gros probleme, les 2 events ont une curve");
        console.log("ancien ", tempoEventAtSameLocation);
        console.log("celui que j'essaye de créer ", bar, beat, tempo, curve);
        console.log("je décide de garder l'ancien");
        return;
      } else {
        return;
      }
    } else {
      if (curve === null) {
        return;
      }
    }
  }

  let thisEvent = events.find(e => e.type === "BAR" && e.bar === bar);

  if (thisEvent !== undefined) {
    events.push({
      type: 'TEMPO',
      bar: bar,
      beat: beat,
      bpm: tempo,
      curve: curve,
      basis: TimeSignature.get(`1/${thisEvent.signature.lower}`),
    });
  } else {
    let myLoop = true;
    let i = 1;

    while (myLoop === true) {
      thisEvent = events.find(e => e.type === "BAR" && e.bar === (bar-i));
      if (thisEvent !== undefined) {
        myLoop = false;
      } else {
        i+=1;
      }
    };

    events.push({
      type: 'TEMPO',
      bar: bar,
      beat: beat,
      bpm: tempo,
      curve: curve,
      basis: TimeSignature.get(`1/${thisEvent.signature.lower}`),
    });
  };
};

function simpleParsing(line) {
  if (cmd.includes(line[1])) {
    switch (line[1]) {
      case 'fermata':
        events.push({
          type: 'FERMATA',
          bar: parseInt(line[0]),
          beat: 1,
          duration: +Infinity
        });
        break;
      case 'timer':
        const time = parseTime(line[2]);

        if (time === null) {
          console.log("cannot parse ", line);
        } else {
          events.push({
            type: 'FERMATA',
            bar: parseInt(line[0]),
            beat: 1,
            duration: parseTime(line[2]),
          });
        }
        break;
    }
  } else {
    const thisSignature = line[1];

    events.push({
      type: 'BAR',
      bar: parseInt(line[0]),
      beat: 1,
      signature: TimeSignature.get(thisSignature),
    });

    if (line.length === 3) {
      addTempoEvent(parseInt(line[0]), 1, parseFloat(line[2]));
    }
  }
}

function curveParsing(line) {
  const thisBar = parseInt(line[0]);
  const simpleEvent = line.splice(0,2);

  simpleParsing(simpleEvent);

  if (line.length === 3) {
    line.push(1);
  }

  const sanitizedLine = chunk(line,4);

  sanitizedLine.forEach(quad => {
    if (quad.length === 4) {
      if (parseInt(quad[3]) !== 1) {
        addTempoEvent(thisBar, 1, parseFloat(quad[0]));
      }

      addTempoEvent(thisBar, parseInt(quad[3]), parseFloat(quad[0]), 1);

      endCurvePositionArray.push({
        beginBar: thisBar,
        beginBeat: parseInt(quad[3]),
        beatCurveTime: parseInt(quad[2]),
        endTempo: parseFloat(quad[1])
      });
    };
  });
};

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


endCurvePositionArray.forEach(line => {
  // compute offset of beatCurveTime and beginBeat to have beginBeat on 1

  if (line.beginBeat !== 1) {
    line.curveTimeFromFirstBeat = line.beatCurveTime + (line.beginBeat-1);
  } else {
    line.curveTimeFromFirstBeat = line.beatCurveTime;
  }

  // initialize journey
  line.currentBar = line.beginBar;
  line.currentBeat = 1;
  let thisEvent = events.find(e => e.type === "BAR" && e.bar === line.currentBar);
  const { lower, upper } = thisEvent.signature;
  line.currentSignature = TimeSignature.get(`${upper}/${lower}`);

  for (let i = 0; i < line.curveTimeFromFirstBeat; i++) {
    line.currentBeat += 1;

    if (line.currentBeat > line.currentSignature.upper) {
      line.currentBar += 1;
      line.currentBeat = 1;
      thisEvent = events.find(e => e.type === "BAR" && e.bar === line.currentBar);

      if (thisEvent !== undefined) {
        const { lower, upper } = thisEvent.signature;
        line.currentSignature = TimeSignature.get(`${upper}/${lower}`);
      }
    }
  }
  // print endCurvePositionArray
  // console.log(line);
  addTempoEvent(line.currentBar, line.currentBeat, line.endTempo);

});

// now we have to sort events by time
// @TODO

// and then parse to our format
const output = soapScoreEventParser(events);
fs.writeFileSync(outputFileName, output);
console.log('done');


// console.log(events);
// console.log(cleanArray)


