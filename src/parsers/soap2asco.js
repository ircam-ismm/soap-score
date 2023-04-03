import fs from 'node:fs';
import path from 'node:path';

import TimeSignature from '@tonaljs/time-signature';

import { parseScore } from '../soap-score-parser.js';

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

    const events = parseScore(score);
    let output = ``;
    let previousEvent = events[0];

    let numberOfTicks = previousEvent.tempo.basis.upper * previousEvent.signature.upper;

    for (let i = 0;i<numberOfTicks;i++) {
      //count beats
      // need to find in events a bar/beat < currentBarBeat
        // dans ce cas - update state
        // previousEvent = thisEvent
      // else
        // write beats in output
    }

    return output;
  },
};

export default soap2asco;


