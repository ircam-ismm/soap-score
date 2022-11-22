// import fs from 'node:fs';
import TimeSignature from '@tonaljs/time-signature';
import parseDuration from 'parse-duration';

const splitWordsRegexp = / +(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
// @note - must accept composed signature 2+3+2/8
const signatureRegexp = /\[[0-9\+]+\/[0-9]+\]/;
const absDurationRegexp = /\[[0-9hms]+\]/;
const bracketDefaultRegExp = /\[.*\]/;
const tempoEquivalenceRegexp = /\[[0-9]+\/[0-9]+\]\-\>\[[0-9]+\/[0-9]+\]/;
// this one is private, but splitted for testing purposes
export function soapFormatScore(score) {
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

      const line = str.split(splitWordsRegexp).map(el => el.trim());

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

export function soapScoreParser(fileOrText) {
  const formattedScore = soapFormatScore(fileOrText);

  const lines = formattedScore.split('\n');
  const ir = [];

  lines.forEach((line, index) => {
    const parts = line
      .split('|')
      .map(parts => parts.trim())
      .map(parts => parts.split(splitWordsRegexp).map(word => word.trim()));

    const bar = parts.shift();
    let currentBar = index === 0 ? 1 : null;

    // parse bar
    const event = {
      type: 'BAR',
      bar: null,
      beat: 1,
    };

    // @todo - refactor to enforce positionnal
    for (let i = 1; i < bar.length; i++) {
      const el = bar[i];

      // bar has a time signature
      if (signatureRegexp.test(el)) {
        const sig = el.slice(1, -1);
        event.signature = TimeSignature.get(sig);
      // bar is expressed in absolute time
      } else if (absDurationRegexp.test(el)) {
        const dur = el.slice(1, -1); // remove brackets
        event.duration = parseDuration(dur, 's');
      // this is the bar number
      } else if (bracketDefaultRegExp.test(el)) {
        throw new Error(`Invalid bracket syntax for signature or absolute duration in line ${line}`);
      } else {
        // this is a marker
        currentBar = parseInt(el);
      }
    }

    if (currentBar === null) {
      throw new Error(`Invalid syntax for BAR in line, no bar number given: ${line}`);
    }

    event.bar = currentBar;

    ir.push(event);

    // parse other events
    parts.forEach(part => {
      const event = {
        type: part[1],
        bar: currentBar,
        beat: parseFloat(part[0]),
      };

      switch (event.type) {
        case 'LABEL':
          if (part.length > 3) {
            throw new Error(`Invalid syntax for LABEL in line: ${line}`);
          }

          event.label = part[2].slice(1, -1); // remove quotes
          break;
        case 'FERMATA':
          if (part.length > 3) {
            throw new Error(`Invalid syntax for FERMATA in line: ${line}`);
          }

          if (part[2]) {
            event.duration = parseDuration(part[2].slice(1, -1));
          } else {
            event.duration = null;
          }
          break;
        case 'TEMPO':
          // if we are in front of a tempo equivalence
          if (tempoEquivalenceRegexp.test(part[2])) {
            if (part.length > 3) {
              throw new Error(`Invalid syntax for TEMPO in line: ${line}`);
            }

            // find last tempo and last tempo signature
            let lastBPM = null;
            let lastTempoSignature = null;

            for (let i = ir.length - 1; i >= 0; i--) {
              let event = ir[i];

              if (event.type === 'TEMPO') {
                // bpm is mandatory is TEMPO definition
                lastBPM = event.bpm;

                if (event.signature) {
                  lastTempoSignature = TimeSignature.get(event.signature.name);
                }
              }
            }

            // @todo - review when tempo is more solid
            if (lastTempoSignature === null) {
              lastTempoSignature = TimeSignature.get('1/4');
            }

            const lastUnitEq = part[2].replace(/\-\>\[[0-9]+\/[0-9]+\]/, '');
            const newUnitEq = part[2].replace(/\[[0-9]+\/[0-9]+\]\-\>/, '');

            const lastUnitEqSignature = TimeSignature.get(lastUnitEq.slice(1, -1));
            // ratio betwen the last defined signature and signature before convertion
            const tempoRatio = (lastTempoSignature.upper / lastTempoSignature.lower) /
              (lastUnitEqSignature.upper / lastUnitEqSignature.lower);

            event.bpm = lastBPM * tempoRatio;
            event.signature = TimeSignature.get(newUnitEq.slice(1, -1));
          } else {
            if (part.length > 4) {
              throw new Error(`Invalid syntax for TEMPO in line: ${line}`);
            }

            if (!part[2]) {
              throw new Error(`Invalid syntax for TEMPO, bpm is mandatory, in line: ${line}`);
            }

            event.bpm = parseFloat(part[2]);

            if (part[3]) {
              if (signatureRegexp.test(part[3])) {
                event.signature = TimeSignature.get(part[3].slice(1, -1));
              } else {
                throw new Error(`Invalid syntax for TEMPO signature in line: ${line}`)
              }
            }
          }
          break;
        default:
          throw new Error(`Invalid command: ${event.type}`);
          break;
      }

      ir.push(event);
    });

    // @todo - review, find the first bar with a signature and check for tempo there
    // first bar could have absolute time
    // if (currentBar === 1) {
    //   if (ir[0].type !== 'BAR') {
    //     throw new Error(`Invalid score, should start with a BAR command`);
    //   }

    //   let hasTempo = false;

    //   // this should be done when creating the tempo event?
    //   // events.forEach(event => {
    //   //   if (event.type === 'TEMPO' && event.beat === 1) {
    //   //     hasTempo = true;

    //   //     if (!event.signature) {
    //   //       // define signature according to bar
    //   //       const equivalences = {
    //   //         '2/4': '1/4'
    //   //         '3/4': '1/4'
    //   //         '4/4': '1/4'
    //   //         '3/8': '1/8'
    //   //         '6/8': '1/8'
    //   //         '9/8': '1/8'
    //   //       };
    //   //       const bar = events[0];
    //   //       const barSignature = bar.signature.name;

    //   //       if (equivalences[barSignature]) {

    //   //       }
    //   //
    //   //       event.signature
    //   //     }
    //   //   }
    //   // });

    //   if (!hasTempo) {
    //     throw new Error(`Invalid score, a TEMPO should be defined on first beat`);
    //   }
    // }
  });

  // @todo - stable sort by bar and beat
  // then compare order is the same as in `ir`
  // see https://lodash.com/docs/4.17.15#sortBy

  return ir;
}

