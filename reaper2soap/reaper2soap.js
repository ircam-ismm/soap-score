let midiParser  = require('midi-parser-js');
let fs = require('fs')

let output = ``;


function computeMetricTime(prevUpper, prevLower, triggerTime) {
  const beatTime = 4 / prevLower;
  const measureTime = beatTime * prevUpper;
  const triggerMeasure = (triggerTime / measureTime);
  return triggerMeasure;
}

function createOutputFile(dataset) {
  output = ``;
  Object.keys(dataset).forEach(bar => {
    if (!dataset[bar].marker) {
      output += `BAR ${bar} [${dataset[bar].metric.upper}/${dataset[bar].metric.lower}]\n`
    }
    else {
      output += `BAR ${bar} [${dataset[bar].metric.upper}/${dataset[bar].metric.lower}] "${dataset[bar].marker}"\n`
    }
    output += `| TEMPO ${dataset[bar].tempo} 1/4\n`
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
  let dataset = {};

  rawTempoList.forEach(line => {
    currentMeasure = computeMetricTime(currentMetric.upper, currentMetric.lower, line.deltaTime/timeDiv) + currentMeasure;
    if (!dataset[currentMeasure]) {
      dataset[currentMeasure] = {};
    }
    switch (line.metaType) {
      case 3:
        outputFileName = line.data;
        break;
      case 6:
        dataset[currentMeasure].marker = line.data;
        break;
      case 81:
        const thisTempo = Math.round( (60000000 / line.data) * 100 ) / 100 ;
        dataset[currentMeasure].tempo = thisTempo;
        break;
      case 88:
        thisMetric = {upper: line.data[0], lower: Math.pow(2,line.data[1])};
        dataset[currentMeasure].metric = thisMetric;
        currentMetric = thisMetric;
        break;
      default:
        break;
    }

  });
  output = createOutputFile(dataset);
  fs.writeFileSync(`${outputFileName}.soap`, output);
  console.log(output);
});


