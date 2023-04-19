// import fs from 'node:fs';
// import path from 'node:path';

import midiParser from 'midi-parser-js';

import TimeSignature from '@tonaljs/time-signature';

import { writeScore } from '../soap-score-writer.js';

function computeMetricLocation(events) {

  let previousMetricAtTime = events[0].signature;
  let floatingBar = 1;

  events.forEach( (e,i) => {
    // compute floatingBar
    floatingBar += e.relBeat / ( (4/previousMetricAtTime.lower)*previousMetricAtTime.upper );
    // add bar and beat to event
    e.bar = Math.floor(floatingBar);
    e.beat = 1 + ( (floatingBar - Math.floor(floatingBar)) * (e.signature.upper * 4 / e.signature.lower) );
    // previousMetric devient currentMetric
    previousMetricAtTime = e.signature;
  });

  // console.log(events);

  return events;
}

const midi2soap = {
  write: function(output, soapScore) {
    fs.writeFileSync(output, soapScore);
  },
  readFile(input) {
    if (!fs.existsSync(input)) {
      throw new Error(`file do not exist`);
    }

    // Parse the obtainer base64 string ...
    const file = fs.readFileSync(input, 'base64');
    const midi = midiParser.parse(file);
    const data = midi.track[0].event;
    const timeDiv = midi.timeDivision;
    const soapScore = this.parse(data, timeDiv);

    return soapScore;
  },
  readString(input) {
    const midi = midiParser.parse(input);
    const data = midi.track[0].event;
    const timeDiv = midi.timeDivision;
    const soapScore = this.parse(data, timeDiv);
    return soapScore;
  },
  createSoapFile(input, output) {
    write(output, read(input))
  },
  outputLineForDebug(input) {
    const midi = midiParser.parse(input);
    const data = midi.track[0].event;
    const output = [];
    data.forEach(line => {
      output.push(line);
    })
    return output;
  },
  parse: function(data, timeDiv = 960) {

    let events = [];
    let deltaTime = null;
    let previousDeltaTime = 0;
    let signature = null;
    let bpm = null;
    let label = null;
    let absTime = 0;
    let previousAbsTime = 0;

    data.forEach((line,index) => {
      // for debug
      // console.log(line);
      deltaTime = line.deltaTime / timeDiv;
      absTime += deltaTime;
      // console.log("absTime ", absTime);
      // console.log("delta time", deltaTime);

      // on publie à chaque changement de temps ou si c'est le dernier evenement de la liste
      if ( absTime !== previousAbsTime || data.length === (index+1)) {
        // push event
        events.push({
          bar: null,
          beat: null,
          relBeat: previousDeltaTime,
          signature: signature,
          duration: null,
          tempo: {
            basis: TimeSignature.get(`1/4`),
            bpm: bpm,
            curve: null,
          },
          fermata: null,
          label: label,
        });
      };
      // retrieves info from line
      switch (line.metaType) {
        case 81:
          bpm = Math.round((60000000/line.data)*1000)/1000;
          // compute tempo
          break;
        case 88:
          signature = TimeSignature.get(`${line.data[0]}/${Math.pow(2,line.data[1])}`);
          // compute metric
          break;
        case 6:
          label = line.data;
          // compute label
          break;
        case 1:
          // compute tempo curve
          break;
        default:
          break;
      };

      if (deltaTime !== 0) {
        previousDeltaTime = deltaTime;
      }
      previousAbsTime = absTime;

    });
    events = computeMetricLocation(events);
    // console.log(events);
    const output = writeScore(events);
    return output;
  },
};

// midi2soap.fromFile('curve_score.mid');

export default midi2soap;

