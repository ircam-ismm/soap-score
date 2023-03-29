// import fs from 'node:fs';
import TimeSignature from '@tonaljs/time-signature';
import parseDuration from 'parse-duration';
import cloneDeep from 'lodash.clonedeep';

const splitWordsRegexp = / +(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
// @note - must accept composed signature 2+3+2/8
export const signatureRegexp = /^\[([0-9\+]+)\/([0-9]+)\]$/;
export const absDurationRegexp = /^([0-9hms\.]+)$/;
export const bracketDefaultRegExp = /^\[.*\]$/;
export const tempoEquivalenceRegexp = /^\[([0-9]+\/[0-9]+)\]\=\[([0-9]+\/[0-9]+)\]/;
export const tempoSyntaxRegexp = /^\[([0-9]+\/[0-9]+)\]\=([0-9\.]+)$/;
export const fermataSyntaxRegexp = /^\[([0-9]+\/[0-9]+)\]\=([0-9hms\?\*\.]+)$/;


/**
 * Format user-friendly syntax to verbose syntax
 */
export function formatScore(score) {
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


/**
 * Return verbose list of events, kind of intermediate level representation:
 * const events = [
 *   {
 *     type: 'BAR'
 *     bar: Integer=1,
 *     beat: Float=1,
 *
 *     signature: null || TimeSignature {
 *       upper: Number=4
 *       lower: Number=4
 *     },
 *     duration: null,
 *   }
 *   {
 *     type: 'TEMPO'
 *     bar: Integer=1,
 *     beat: Float=1,
 *
 *     basis: null || TimeSignature {
 *       upper: Number=1
 *       lower: Number=4
 *     },
 *     bpm: null || Number=60,
 *     bpm_curve: null || Number=1
 *   }
 *   {
 *     type: 'FERMATA'
 *     bar: Integer=1,
 *     beat: Float=1,
 *     duration: null || Number=+Infinity
 *   }
 *   {
 *     type: 'LABEL'
 *     bar: Integer=1,
 *     beat: Float=1,
 *     label: String="",
 *   }
 *   // ...
 * ];
 */
export function getEventList(score) {
  const formattedScore = formatScore(score);

  const lines = formattedScore.split('\n');
  const ir = [];

  lines.forEach((line, index) => {
    const parts = line
      .split('|')
      .map(parts => parts.trim())
      .map(parts => parts.split(splitWordsRegexp).map(word => word.trim()));

    const bar = parts.shift();

    // parse bar
    const event = {
      type: 'BAR',
      bar: null,
      beat: 1,
      signature: null,
      duration: null,
    };

    // first index is bar number
    const barNumber = bar[1];
    if (barNumber === undefined) {
      throw new Error(`Invalid syntax for BAR in line, no bar number given: ${line}`);
    }

    const currentBar = parseInt(barNumber);

    if (Number.isNaN(currentBar) || currentBar < 1) {
      throw new Error(`Invalid syntax for BAR in line, number given is not a number or is below 1`);
    }

    event.bar = currentBar;

    // second index (if present) is duration or signature
    if (bar[2] !== undefined) {
      if (signatureRegexp.test(bar[2])) {
        const sig = bar[2].slice(1, -1);
        event.signature = TimeSignature.get(sig);
      } else {
        event.duration = parseDuration(bar[2], 's');
      }
    }

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
          const value = part[2];

          console.log(value);

          if (fermataSyntaxRegexp.test(value)) {
            const parts = value.split('=');
            event.basis = TimeSignature.get(parts[0].slice(1, -1));

            if (parts[1] === '?') {
              event.suspended = true;
            } else if (parts[1].endsWith('*')) {
              event.relDuration = parseFloat(parts[1].slice(0, -1));
            } else {
              event.absDuration = parseDuration(parts[1], 's');
            }
          } else {
            throw new Error(`Invalid syntax for FERMATA in line: ${line}`);
          }
          break;
        case 'TEMPO':
          // @todo parse tempo curve

          // tempo equivalence syntax
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
                // bpm is mandatory in TEMPO definition
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

            const lastUnitEq = part[2].replace(/\=\[[0-9]+\/[0-9]+\]/, '');
            const newUnitEq = part[2].replace(/\[[0-9]+\/[0-9]+\]\=/, '');

            const lastUnitEqSignature = TimeSignature.get(lastUnitEq.slice(1, -1));
            // ratio betwen the last defined signature and signature before convertion
            const tempoRatio = (lastTempoSignature.upper / lastTempoSignature.lower) /
              (lastUnitEqSignature.upper / lastUnitEqSignature.lower);

            event.bpm = lastBPM * tempoRatio;
            event.basis = TimeSignature.get(newUnitEq.slice(1, -1));
          // normal syntax
          } else if (tempoSyntaxRegexp.test(part[2])) {
            const [basis, bpm] = part[2].split('=');

            event.bpm = parseFloat(bpm);
            event.basis = TimeSignature.get(basis.slice(1, -1));
          } else {
            throw new Error(`Invalid syntax for TEMPO signature in line: ${line}`)
          }
          break;
        default:
          throw new Error(`Invalid command: ${event.type}`);
          break;
      }

      ir.push(event);
    });
  });

  // @todo - stable sort by bar and beat
  // then compare order is the same as in `ir`
  // see https://lodash.com/docs/4.17.15#sortBy

  return ir;
}

function insertEventInList(event, list) {
  console.log(event);
  if (event.duration === null && event.signature === null) {
    throw new Error(`A bar should have a either a duration or a signature defined`);
  }

  if (event.signature !== null && event.tempo === null) {
    throw new Error(`A bar with a signature should have a tempo defined`);
  }

  list.push(event);
}

/**
 * Return a list of events
 * ```
 * const events = [
 *   {
 *     bar: Integer,
 *     beat: Float,
 *     signature: TimeSignature { upper: Integer, lower: Number },
 *     // is a duration is set, it takes precedance over tempo
 *     duration: null || Number
 *     tempo: null || {
 *       basis: timeSignature { upper: Integer, lower: Number },
 *       bpm: Float,
 *       curve: null || {
 *         start: { bar, beat },
 *         end: { bar, beat },
 *         exponent: Float
 *       },
 *     },
 *     fermata: null || {
 *       basis: timeSignature { upper: Integer, lower: Number },
 *       // onlt one of these should be non `null`
 *       absDuration: null || Number,
 *       relDuration: null || Number,
 *       suspended: null || true,
 *     },
 *     label: null || String,
 *   }
 * ];
 * ```
 */
export function parseScore(score) {
  const ir = getEventList(score);
  const list = [];

  let currentEvent = {
    bar: 1,
    beat: 1,
    duration: null,
    signature: null,
    tempo: null,
    fermata: null,
    label: null,
  };

  for (let index = 0; index < ir.length; index++) {
    let event = ir[index];

    console.log(event);

    if (event.bar !== currentEvent.bar || event.beat !== currentEvent.beat) {
      // store current event
      insertEventInList(currentEvent, list);
      // deep copy current event and re-initialize
      currentEvent = cloneDeep(currentEvent);
      currentEvent.bar = event.bar;
      currentEvent.beat = event.beat;
      // reset field that are not persisted
      currentEvent.duration = null,
      currentEvent.label = null;
      currentEvent.fermata = null;
      // keep other fields untouched, bpmCurve is reset to null when only needed
    }

    switch (event.type) {
      case 'BAR':
        if (event.signature) {
          currentEvent.signature = event.signature;
        }

        if (event.duration) {
          currentEvent.duration = event.duration;
        }
        // @todo - handle event duration
        break;
      case 'TEMPO':
        // these are mandatory in getEventList
        if (currentEvent.tempo === null) {
          currentEvent.tempo = {};
        }

        currentEvent.tempo.basis = event.basis;
        currentEvent.tempo.bpm = event.bpm;

        if (event.bpmCurve) {
          const start = { bar: currentEvent.bar, beat: currentEvent.beat };
          // find next TEMPO event in list
          let nextTempoEvent = null;

          for (j = index + 1; j < ir.length; j++) {
            if (ir[j].type === 'TEMPO') {
              nextTempoEvent = ir[j];
              break;
            }
          }

          if (nextTempoEvent === null) {
            throw new Error(`Tempo curve has no end`);
          }

          const end = { bar: nextTempoEvent.bar, beat: nextTempoEvent.beat };
          const exponent = event.bpmCurve;

          currentEvent.tempo.curve = { start, end, exponent };
        } else {
          currentEvent.tempo.curve = null;
        }
        break;
      case 'FERMATA':
        currentEvent.fermata = event.duration;
        break;
      case 'LABEL':
        currentEvent.label = event.label;
        break;
    }
  }
  // push last event into list
  insertEventInList(currentEvent, list);

  return list;
}
