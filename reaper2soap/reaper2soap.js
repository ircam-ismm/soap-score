import midiParser from 'midi-parser-js';
import fs from 'node:fs';
import { soapScoreEventParser } from '../src/soap-score-parser.js';

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
  let myBeat = 1 + ( (floatMeasure - Math.floor(myBar)) * upper );
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
  const rawTempoList = midiArray.track[0].event
  const timeDiv = midiArray.timeDivision;
  let currentMetric = {upper: 4, lower: 4};
  let currentFloatMeasure = 1;
  let thisMetric = {};
  let events = [];
  let index = 0;

  rawTempoList.forEach((line) => {
    currentFloatMeasure = computeMetricTime(currentMetric.upper, currentMetric.lower, line.deltaTime/timeDiv) + currentFloatMeasure;
    const currentBarBeat = computeBarBeat(currentMetric.upper, currentMetric.lower, Math.round(currentFloatMeasure*1000)/1000);

    index = events.push({bar:currentBarBeat.bar,beat:currentBarBeat.beat});
    index -= 1;

    switch (line.metaType) {
      case 6:
        events[index].type = "LABEL";
        events[index].label = line.data;
        break;
      case 81:
        // @TODO parse TEMPO CURVE FROM REAPER
        events[index].type = "TEMPO";
        const thisTempo = Math.round( (60000000 / line.data) * 1000 ) / 1000;
        events[index].bpm = thisTempo;
        events[index].curve = null;
        break;
      case 88:
        events[index].type = "BAR";
        thisMetric = {upper: line.data[0], lower: Math.pow(2,line.data[1])};
        events[index].signature = thisMetric;
        currentMetric = thisMetric;
        break;
      default:
        break;
    }

  });
  const cleanEvents = parseUnusableEvent(events);
  const output = soapScoreEventParser(cleanEvents);
  fs.writeFileSync(outputFileName, output);
  console.log('done');
});


