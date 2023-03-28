import fs from 'node:fs';
import midiParser from 'midi-parser-js';
import TimeSignature from '@tonaljs/time-signature';

import { soapScoreFromEvent } from '../src/soap-score-parser.js';
import { checkSoapEvent } from '../src/check-soap-events.js';

const inputFilename = process.argv.slice(2);
const strInputFileName = `./${inputFilename[0]}`
const outputFileName = `${inputFilename[0].slice(0,-4)}.soap`;
console.log('parsing ', strInputFileName, ' and saving into ', outputFileName);

function computeMetricTime(prevUpper, prevLower, triggerTime) {
  const beatTime = 4 / prevLower;
  const measureTime = beatTime * prevUpper;
  const myBar = (triggerTime / measureTime);
  // const myBeat =
  return myBar;
}

function computeBarBeat(upper, lower, floatMeasure) {
  const myBar = Math.floor(floatMeasure);
  const normalizedUpper = upper * 4 / lower;
  let myBeat = 1 + ( (floatMeasure - Math.floor(myBar)) * normalizedUpper );
  myBeat = Math.round(myBeat*100)/100;
  return {bar:myBar, beat:myBeat};


}

function parseUnusableEvent(events) {
  const cleanEvents = []
  events.forEach((e) => {
    if (Object.keys(e).length > 2) {
      cleanEvents.push(e);
    }
  });
  return cleanEvents;
}

// read a .mid binary (as base64)
fs.readFile(strInputFileName, 'base64', function (err,data) {
  // Parse the obtainer base64 string ...
  const midiArray = midiParser.parse(data);
  // done!
  const rawTempoList = midiArray.track[0].event;
  const timeDiv = midiArray.timeDivision;
  let currentMetric = TimeSignature.get(`4/4`);
  let currentFloatMeasure = 1;
  let events = [];
  let isInTempoCurve = false;

  rawTempoList.forEach((line) => {
    currentFloatMeasure = computeMetricTime(currentMetric.upper, currentMetric.lower, line.deltaTime/timeDiv) + currentFloatMeasure;
    const currentBarBeat = computeBarBeat(currentMetric.upper, currentMetric.lower, Math.round(currentFloatMeasure*1000)/1000);

    // console.log(line);

    switch (line.metaType) {
      case 1: {

        if (isInTempoCurve === false) {
          // find tempo from line.data
          const rawArray = line.data.split(" ");
          const currentTempo = Number(rawArray.slice(-1)[0]);

          events.push({
            type: 'TEMPO',
            bar: currentBarBeat.bar,
            beat: currentBarBeat.beat,
            basis: TimeSignature.get(`1/4`),
            bpm: currentTempo,
            curve: 1,
          });

          isInTempoCurve = true;

        } else {
          isInTempoCurve = false;
        }
        break;
      }
      case 6: {
        events.push({
          type: 'LABEL',
          bar: currentBarBeat.bar,
          beat: currentBarBeat.beat,
          label: line.data,
        });
        break;
      }
      case 81: {
        // @TODO parse TEMPO CURVE FROM REAPER

        if (isInTempoCurve === false) {
          const thisTempo = Math.round( (60000000 / line.data) * 1000 ) / 1000;
          events.push({
            type: 'TEMPO',
            bar: currentBarBeat.bar,
            beat: currentBarBeat.beat,
            basis: TimeSignature.get(`1/4`),
            bpm: thisTempo,
            curve: null,
          });
        }
        break;
      }
      case 88: {
        const upper = line.data[0];
        const lower = Math.pow(2,line.data[1]);
        events.push({
          type: 'BAR',
          bar: currentBarBeat.bar,
          beat: currentBarBeat.beat,
          signature: TimeSignature.get(`${upper}/${lower}`),
          duration: null,
        });
        currentMetric = TimeSignature.get(`${upper}/${lower}`);
        break;
      }
      default: {
        break;
      }
    }

  });

  const cleanEvents = parseUnusableEvent(events);

  cleanEvents.forEach(e => {
    checkSoapEvent(e);
  });
  // console.log(cleanEvents)
  let output = `// Score Generated from reaper2soap on ${new Date}\n`;
  output += soapScoreFromEvent(cleanEvents);
  fs.writeFileSync(outputFileName, output);
  console.log('done');
});


