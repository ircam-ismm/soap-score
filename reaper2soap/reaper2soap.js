let midiParser  = require('midi-parser-js');
let fs = require('fs')

let output = ``;


function computeMetricTime(prevUpper, prevLower, triggerTime) {
  const beatTime = 4 / prevLower;
  const measureTime = beatTime * prevUpper;
  const myBar = (triggerTime / measureTime);
  // const myBeat =
  return myBar;
}

function computeBarBeat(upper, lower, floatMeasure) {
  const myBar = Math.floor(floatMeasure);
  let myBeat = 1 + ( (floatMeasure - Math.floor(myBar)) * lower );
  myBeat = Math.round(myBeat*100)/100;
  return {bar:myBar, beat:myBeat};
}

function createOutputFile(events) {
  output = ``;
  events.forEach((e) => {
    output += `BAR ${e.bar}`
    if (e.signature) {
      output +=  ` [${e.signature.upper}/${e.signature.lower}]`
    }
    //cassé
    if (e.label) {
      output += ` "${e.label}"\n`
    }
    else {
      output += `\n`
    }
    //cassé
    if (e.bpm) {
      if (e.beat !== 1) {
        output += `| TEMPO ${e.bpm} [1/4]\n`
      }
      else {
        output += `|${e.beat} TEMPO ${e.bpm} [1/4]\n`
      }
    }
  });
  return output;
}


// read a .mid binary (as base64)
fs.readFile('./sample_score.mid', 'base64', function (err,data) {
  // Parse the obtainer base64 string ...
  const midiArray = midiParser.parse(data);
  // done!
  const rawTempoList = midiArray.track[0].event
  const timeDiv = midiArray.timeDivision;
  let currentMetric = {upper: 4, lower: 4};
  let currentMeasure = 1;
  let outputFileName = "";
  let thisMetric = {};
  let events = [];
  let index = 0;

  rawTempoList.forEach((line) => {
    currentMeasure = computeMetricTime(currentMetric.upper, currentMetric.lower, line.deltaTime/timeDiv) + currentMeasure;
    currentBarBeat = computeBarBeat(currentMetric.upper, currentMetric.lower, currentMeasure);

    const elemBar = events.find(ev => ev.bar === currentBarBeat.bar);
    const indexBar = events.findIndex(ev => ev.bar === currentBarBeat.bar);

    if (elemBar === undefined) {
      index = events.push({bar:currentBarBeat.bar,beat:currentBarBeat.beat});
      index -= 1;
    }
    else if (events[indexBar].beat !== currentBarBeat.beat) {
      index = events.push({bar:currentBarBeat.bar, beat:currentBarBeat.beat});
      index -=1;
    }

    switch (line.metaType) {
      case 3:
        outputFileName = line.data;
        break;
      case 6:
        events[index].label = line.data;
        break;
      case 81:
        const thisTempo = Math.round( (60000000 / line.data) * 1000 ) / 1000;
        events[index].bpm = thisTempo;
        break;
      case 88:
        thisMetric = {upper: line.data[0], lower: Math.pow(2,line.data[1])};
        events[index].signature = thisMetric;
        currentMetric = thisMetric;
        break;
      default:
        break;
    }

  });
  output = createOutputFile(events);
  fs.writeFileSync(`${outputFileName}.soap`, output);
  console.log(output);
});


