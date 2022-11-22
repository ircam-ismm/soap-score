let midiParser  = require('midi-parser-js');
let fs = require('fs')

let output = ``;

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
  cleanEvents = []
  events.forEach((e) => {
    if (Object.keys(e).length > 2) {
      cleanEvents.push(e);
    }
  });
  return cleanEvents;
}

function createOutputFile(events) {
  output = ``;
  let lastWrittenBar = 0;
  events.forEach((e) => {
    switch (e.type) {
      case 'BAR':
        output += `BAR ${e.bar} [${e.signature.upper}/${e.signature.lower}]\n`
        lastWrittenBar = e.bar;
        break;
      case 'TEMPO':
        if (lastWrittenBar !== e.bar) {
          output += `BAR ${e.bar}\n`
        }
        output += `|${e.beat} TEMPO ${e.bpm} [1/4]\n`
        break;
      case 'LABEL':
        if (lastWrittenBar !== e.bar) {
          output += `BAR ${e.bar}\n`
        }
        output += `|${e.beat} "${e.label}"\n`
        break;
    }
  });
  return output;
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
    currentBarBeat = computeBarBeat(currentMetric.upper, currentMetric.lower, Math.round(currentFloatMeasure*1000)/1000);

    index = events.push({bar:currentBarBeat.bar,beat:currentBarBeat.beat});
    index -= 1;

    switch (line.metaType) {
      case 6:
        events[index].type = "LABEL";
        events[index].label = line.data;
        break;
      case 81:
        events[index].type = "TEMPO";
        const thisTempo = Math.round( (60000000 / line.data) * 1000 ) / 1000;
        events[index].bpm = thisTempo;
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
  cleanEvents = parseUnusableEvent(events);
  output = createOutputFile(cleanEvents);
  fs.writeFileSync(outputFileName, output);
  console.log('done');
});


