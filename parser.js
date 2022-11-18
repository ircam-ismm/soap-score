import fs from 'node:fs';
import TimeSignature from '@tonaljs/time-signature';
import parseDuration from 'parse-duration'


const score = fs.readFileSync('./syntax-proposal.soap').toString();

const Position = {
  get(str) {
    let parts = str.split('|');
    parts = parts.map(el => parseInt(el));

    return {
      measure: parts[0],
      beat: parts[1] || 1,
    }
  }
}

const parseCommand = {
  TEMPO: elems => {
    const cmd = elems[0];
    const bpm = parseFloat(elems[1]);

    let basis;
    if (elems[2]) {
      basis = TimeSignature.get(elems[2]);
    } else {
      basis = TimeSignature.get('1/4');
    }

    return { cmd, bpm, basis };
  },
  MEASURE: elems => {
    const cmd = elems[0];
    const number = elems[1];

    const data = { cmd, number };

    for (let i = 2; i < elems.length; i++) {
      if (/\[[0-9]+\/[0-9]+\]/.test(elems[i])) {
        const sig = elems[i].slice(1, -1); // remove brackets
        // this is a time signature
        data.signature = TimeSignature.get(sig);
      } else if (/\[[0-9hms]+\]/.test(elems[i])) {
        const dur = elems[i].slice(1, -1); // remove brackets
        data.duration = parseDuration(dur, 's');
      } else {
        // this is a marker
        data.marker = elems[i];
      }
    }

    return data;
  },
  FERMATA: elems => {
    const cmd = elems[0];
    const position = Position.get(elems[1]);
    return { cmd, position };
  },
  TEMPO_CURVE: elems => {
    const cmd = elems[0];
    const start_position = Position.get(elems[1]);
    const start_tempo = parseFloat(elems[2]);
    const end_position = Position.get(elems[3]);
    const end_tempo = parseFloat(elems[4]);
    const curve = elems[5] ? parseFloat(elems[5]) : 1;

    return { cmd, start_position, start_tempo, end_position, end_tempo, curve };
  },
};

const lines = score.split('\n');
// remove empty lines or comment lines
const parsed = lines
  .map(line => line.trim())
  // remove empty lines or comment lines
  .filter(line => {
    if (line === '' || /^\/\//.test(line)) {
      return false;
    }

    return true
  })
  // remove line ending comments
  .map(line => {
    const elems = line.split(' ').map(el => el.trim());

    let index = null;
    elems.forEach((el, i) => {
      if (el == '//') {
        index = i;
      }
    });

    if (index !== null) {
      elems.splice(index);
    }

    return elems;
  })
  .map(elems => {
    const cmd = elems[0];

    return parseCommand[cmd](elems);
  });

console.log(parsed);
