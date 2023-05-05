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

  parse: function(score, comment = false) {
    const interpreter = new SoapScoreInterpreter(score);
    // console.log(interpreter.score);

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

      if (infos === null) {
        return output;
      }

      const { bar, beat, event, position, duration, dt, unit } = infos;
      // console.log(bar, beat, unit, duration, dt);

      // if (event.label === 'end-of-score') {
      //   return output;
      // }
      if (event.duration) {
        // absolute measure
        event.tempo = {
          bpm:60,
          basis:{
            upper:1,
            lower:4,
          },
        };
        // output += `BPM 60\n`
      }

      if (bar !== currentBar && comment === true) {
        output += `\n; ----------- measure ${bar} --- time signature ${event.signature.name} -----------\n`
      }

      // check if tempo has changed
      if (event !== currentEvent && event.tempo && event.tempo.bpm !== currentEvent.tempo.bpm) {
        // bpm in antescofo -> related to quarter note
        const bpm = event.tempo.bpm * (event.tempo.basis.upper / event.tempo.basis.lower) * 4
        output += `BPM ${bpm}\n`;
      };

      let dtInBeat;
      if (event.duration === null) {
        const { bpm, upper, lower } = unit;
        const beatDuration = 60 / bpm;
        dtInBeat = (unit.upper / unit.lower) * 4;
        dtInBeat = dtInBeat * (dt / beatDuration);
      } else {
        dtInBeat = event.duration;
      }

      let ascoNote = 0;
      if (beat - Math.floor(beat) === 0) {
        ascoNote = beat + 59;
      }

      if (bar !== currentBar) {
        output += `NOTE ${ascoNote} ${dtInBeat} MEASURE_${bar}`;
      } else {
        output += `NOTE ${ascoNote} ${dtInBeat}`;
      }

      // check for a label
      if (event !== currentEvent && event.label) {
        output += ` "${event.label}"\n`;
      } else {
        // console.log(event);
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


