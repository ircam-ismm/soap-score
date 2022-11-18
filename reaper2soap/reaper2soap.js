let midiParser  = require('midi-parser-js');
let fs = require('fs')


function computeMetricTime(prevUpper, prevLower, triggerTime) {
  // input 4 4 16
  const beatTime = 4 / prevLower;
  const measureTime = beatTime * prevUpper;
  const triggerMeasure = (triggerTime / measureTime);
  // console.log(prevUpper, prevLower, triggerTime, triggerMeasure);
  return triggerMeasure;

  // expected output 5
  // input 3 8 1.5
  // expected output 2

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
  let dataset = [];

  rawTempoList.forEach(line => {
    // console.log(line);
    currentMeasure = computeMetricTime(currentMetric.upper, currentMetric.lower, line.deltaTime/timeDiv) + currentMeasure;


    switch (line.metaType) {
      case 6:
        const thisMarker = {name: line.data};
        console.log(`Marker. ${thisMarker.name} @measure ${currentMeasure}`);
        break;
      case 81:
        const thisTempo = {tempo: 60000000 / line.data, time: line.deltaTime/960};
        dataset
        console.log(`Tempo. ${thisTempo.tempo} @measure ${currentMeasure}`);
        break;
      case 88:
        const thisMetric = {upper: line.data[0], lower: Math.pow(2,line.data[1]), time: line.deltaTime/960};
        console.log(`Metric. ${thisMetric.upper} ${thisMetric.lower} @measure ${currentMeasure}`);
        currentMetric = thisMetric;
        break;
      default:
    }

  });

});
