import fs from 'node:fs';
import path from 'node:path';

import TimeSignature from '@tonaljs/time-signature';

import SoapScoreInterpreter from '../SoapScoreInterpreter.js';

const soap2asco = {
  fromFile: function(input, output) {
    if (!fs.existsSync(input)) {
      throw new Error(`coucou`);
    }

    const score = fs.readFileSync(input).toString();
    const soapScore = this.parse(score);

    fs.writeFileSync(output, soapScore);
  },

  parse: function(score) {
    const interpreter = new SoapScoreInterpreter(score);
    let isEndOfScore = false;

    // check to event.label === 'end-of-score' and throw error if not
    interpreter.score.forEach( (e) => {
      if (e.label === "end-of-score") {
        isEndOfScore = true;
      }
    });
    if (isEndOfScore === false) {
      throw new Error('no end-of-score, cannot parse score. Please add a "end-of-score" label at the end of your score');
    }

    let output = ``;
    let currentBar = null;
    let currentBeat = null;
    let currentEvent = {
      bar: null,
      beat: null,
      signature: null,
      duration: null,
      tempo: {
        basis: null,
        bpm: null,
        curve: null,
      },
      fermata: null,
      label: null,
    };

    while (true) {
      let infos = null;
      if (!currentBar) {
        infos = interpreter.getLocationInfos(1, 1);
      } else {
        infos = interpreter.getNextLocationInfos(currentBar, currentBeat);
      }

      const { bar, beat, event, position, basis, duration } = infos;
      // console.log(bar, beat, basis);

      if (event.label === 'end-of-score') {
        return output;
      }
      // console.log(event);

      // check if tempo has changed
      if (event !== currentEvent && event.tempo.bpm !== currentEvent.tempo.bpm) {
        const normalizedBPM = event.tempo.bpm * (event.tempo.basis.upper / event.tempo.basis.lower) / 0.25;
        output += `BPM ${normalizedBPM}\n`;
      };

      if (bar !== currentBar) {
        // output += `; ----------- measure ${bar} --- time signature ${event.signature.name}\n`
        output += `NOTE ${beat+59} ${basis.upper/basis.lower*4} MEASURE_${bar}`;
      } else {
        output += `NOTE ${beat+59} ${basis.upper/basis.lower*4}`;
      }

      // check for a label
      if (event !== currentEvent && event.label) {
          output += ` "${event.label}"\n`;
      } else {
          output += `\n`;
      };

      if (event !== currentEvent) {
        currentEvent = event;
      };

      // console.log(bar, beat, position);

      currentBar = bar;
      currentBeat = beat;

    }

  },
};

export default soap2asco;


