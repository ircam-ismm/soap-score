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

// const parseCommand = {
//   TEMPO: elems => {
//     const cmd = elems[0];
//     const bpm = parseFloat(elems[1]);

//     let basis;
//     if (elems[2]) {
//       basis = TimeSignature.get(elems[2]);
//     } else {
//       basis = TimeSignature.get('1/4');
//     }

//     return { cmd, bpm, basis };
//   },
//   BAR: elems => {
//     const cmd = elems[0];
//     const number = elems[1];

//     const data = { cmd, number };

//     for (let i = 2; i < elems.length; i++) {
//       if (/\[[0-9]+\/[0-9]+\]/.test(elems[i])) {
//         const sig = elems[i].slice(1, -1); // remove brackets
//         // this is a time signature
//         data.signature = TimeSignature.get(sig);
//       } else if (/\[[0-9hms]+\]/.test(elems[i])) {
//         const dur = elems[i].slice(1, -1); // remove brackets
//         data.duration = parseDuration(dur, 's');
//       } else {
//         // this is a marker
//         data.marker = elems[i];
//       }
//     }

//     return data;
//   },
//   FERMATA: elems => {
//     const cmd = elems[0];
//     const position = Position.get(elems[1]);
//     return { cmd, position };
//   },
//   TEMPO_CURVE: elems => {
//     const cmd = elems[0];
//     const start_position = Position.get(elems[1]);
//     const start_tempo = parseFloat(elems[2]);
//     const end_position = Position.get(elems[3]);
//     const end_tempo = parseFloat(elems[4]);
//     const curve = elems[5] ? parseFloat(elems[5]) : 1;

//     return { cmd, start_position, start_tempo, end_position, end_tempo, curve };
//   },
// };

// this one is private, but splitted for testing purposes
export function formatScore(fileOrText) {
  let score;

  if (fs.existsSync(fileOrText)) {
    score = fs.readFileSync(fileOrText).toString();
  } else {
    score = fileOrText;
  }

  // remove empty lines or comment lines
  const lines = score.trim().split('\n')
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
      // keep word in quotes (i.e. labels) intact
      const regexp = / +(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
      const line = str.split(regexp).map(el => el.trim());

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
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];

    // if the line begins with a '|' we want to concatenate it to the previous entry
    if (line[0][0] === '|') {
      // add default beat, if not explicitely given
      if (line[0] === '|') {
        line[0] += '1';
      }

      // concat to previous line
      lines[i - 1] = lines[i - 1].concat(line);
      // remove from list
      lines.splice(i, 1);
    }
  }

  // prepend LABEL to "labels"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (let j = line.length - 1; j >= 0; j--) {
      const word = line[j];

      if (word.startsWith('"') && word.endsWith('"')) {
        const prev = line[j - 1];

        if (prev !== 'LABEL') {
          line.splice(j, 0, 'LABEL');
        }
      }
    }
  }

  // insert pipes before command if not present (simplified syntax)
  lines.forEach(line => {
    for (let i = 0; i < line.length; i++) {
      if (line[i] === 'TEMPO' || line[i] === 'FERMATA' || line[i] === 'LABEL') {
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

  const parsedText = lines.map(line => line.join(' ')).join('\n');
  return parsedText;
}

export default function(fileOrText) {


}

