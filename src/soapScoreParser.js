import fs from 'node:fs';
import TimeSignature from '@tonaljs/time-signature';
import parseDuration from 'parse-duration';

const Position = {
  get(str) {
    let parts = str.split('|');

    return {
      measure: parseInt(parts[0]),
      beat: parseFloat(parts[1]) || 1,
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
  BAR: elems => {
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

export default function(fileOrText, _returnParsedText = false) {
  let score;

  if (fs.existsSync(fileOrText)) {
    score = fs.readFileSync(fileOrText).toString();
  } else {
    score = fileOrText;
  }

  const lines = score.trim().split('\n');
  // remove empty lines or comment lines
  const cleaned = lines
    .map(line => line.trim())
    // remove empty lines or comment lines
    .filter(line => {
      if (line === '' || line.startsWith('//')) {
        return false;
      }

      return true;
    })
    // remove line ending comments
    .map(str => {
      const line = str.split(' ').map(el => el.trim());

      let index = null;
      line.forEach((el, i) => {
        if (el.startsWith('//')) {
          index = i;
        }
      });

      if (index !== null) {
        line.splice(index);
      }

      return line;
    })
    // check that lines begin with 'BAR' or '|'
    .map(line => {
      const first = line[0];

      if (first !== 'BAR' && /^\|[0-9]*/.test(first) === false) {
        throw new Error(`Syntax error: ${line.join(' ')}`);
      }

      return line;
    });

  // pack multiline BAR defs on 1 line
  for (let i = cleaned.length - 1; i >= 0; i--) {
    const line = cleaned[i];

    // if the line begins with a '|' we want to concatenate it to the previous entry
    if (line[0][0] === '|') {
      // add default beat, if not explicitely given
      if (line[0] === '|') {
        line[0] += '1';
      }

      // concat to previous line
      cleaned[i - 1] = cleaned[i - 1].concat(line);
      // remove from list
      cleaned.splice(i, 1);
    }
  }

  // insert pipes before command if not present (simplified syntax)
  cleaned.forEach(line => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === 'TEMPO' || line[i] === 'FERMATA') {
        const prev = line[i - 1];
        // if previous entry is pipe without beat number, default to one
        if (prev === '|') {
          line[i - 1] += '1';
        }

        if (/^\|[0-9]*/.test(prev) === false) {
          let prevBeat = '|1'; // default
          // look for the first beat info before the command
          // e.g. BAR 3 [4/4] |2 TEMPO 60 FERMATA
          for (let j = i - 1; j >= 0; j--) {
            if (/^\|[0-9]*/.test(line[j])) {
              prevBeat = line[j];
            }
          }

          line.splice(i, 0, prevBeat);
        }
      }
    }
  });

  // for debug / tests
  if (_returnParsedText) {
    const parsedText = cleaned.map(line => line.join(' ')).join('\n');
    console.log(parsedText);
    return parsedText;
  }

}

