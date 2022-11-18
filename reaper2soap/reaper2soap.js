let midiParser  = require('midi-parser-js');
let fs = require('fs')

let output = ``;


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
  let outputFileName = "";
  let thisMetric = {};

  function parseLine(line) {
    console.log(line)

    switch (line.metaType) {
      case 3:
        outputFileName = line.data;
        break;
      case 6:
        thisMetric = {marker: line.data};
        // console.log("unparsed");
        break;
      case 81:
        const thisTempo = {tempo: 60000000 / line.data, time: line.deltaTime/960};
        // console.log(`Tempo. ${thisTempo.tempo} @measure ${currentMeasure}`);
        output += `TEMPO ${thisTempo.tempo} 1/4\n`
        break;
      case 88:
        thisMetric = {upper: line.data[0], lower: Math.pow(2,line.data[1]), time: line.deltaTime/960};
        // console.log(`Metric. ${thisMetric.upper} ${thisMetric.lower} @measure ${currentMeasure} Marker. ${  thisMetric.marker}`);
        output += `MEASURE ${currentMeasure} [${thisMetric.upper}/${thisMetric.lower}]\n`
        currentMetric = thisMetric;
        break;
      default:
        break;
    }
  }

  // rawTempoLine.forEach(line )
  // réutiliser forEach et écrire une structure de donnée qui lie une mesure au marker et au tempo.

  for (let i = 0; i < rawTempoList.length; i++) {
    const line = rawTempoList[i];

    currentMeasure = computeMetricTime(currentMetric.upper, currentMetric.lower, line.deltaTime/timeDiv) + currentMeasure;

    // if this is a metric we want to have the tempo info first
    if (line.metaType === 88) {
      const tempoLine = rawTempoList[i+1];
      parseLine(tempoLine);
      i += 1;

      if (rawTempoList[i+2] && rawTempoList[i+2].metaType === 6) {
        const markerLine = rawTempoList[i+2];
        parseLine(markerLine);
        i += 1;
      }
    }
    parseLine(line);
  }

  fs.writeFileSync(`${outputFileName}.soap`, output);
  // console.log(output);
});


