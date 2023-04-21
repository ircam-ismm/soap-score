import midiParser from 'midi-parser-js';
import TimeSignature from '@tonaljs/time-signature';

import { writeScore } from '../soap-score-writer.js';

function computeMetricLocation(events) {
  let bar = 1;
  let beat = 1;
  let signature = events[0].signature;

  events.forEach((event ,index) => {
    // real beat is expressed in quarter note, then in a m [3/8]
    // signature, we have 1.5 relBeat, then we want to express realBeat
    // normalized according to the bar signature
    const numQuarterNoteInBar = (signature.upper / signature.lower) / (1 / 4);
    const normRelBeat = event.relBeat / numQuarterNoteInBar;
    const normBeat = (beat - 1) / numQuarterNoteInBar;
    let nextNormBeat = normBeat + normRelBeat;

    if (Math.abs(Math.round(nextNormBeat) - nextNormBeat) < 1e-6) {
      nextNormBeat = Math.round(nextNormBeat);
    }

    bar += Math.floor(nextNormBeat);

    const remaining = nextNormBeat - Math.floor(nextNormBeat);
    beat = remaining * numQuarterNoteInBar + 1;

    event.bar = bar;
    event.beat = beat;

    signature = event.signature;
  });

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
    // console.log(midi);
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

      // on publie à chaque changement de temps ou si c'est le dernier evenement de la liste
      if ( absTime !== previousAbsTime || line.metaType === 47) {
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
        label = "";
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
          label = line.data;
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
    // console.log(output);
    return output;
  },
};

// midi2soap.fromFile('curve_score.mid');

export default midi2soap;

