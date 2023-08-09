import { isString } from '@ircam/sc-utils';
import cloneDeep from 'lodash.clonedeep';

import {
  splitWordsRegexp,
  barSignatureRegexp,
  absDurationRegexp,
  unitsSignatureRegexp,
  tempoBasisSignatureRegexp,
  tempoEquivalenceRegexp,
  tempoSyntaxRegexp,
  fermataSyntaxRegexp,
} from '../src/utils/regexp.js';

import {
  barSignature,
  barDuration,
  unitsSignature,
  tempoBasisSignature,
} from '../src/utils/time-signatures.js'

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
      if (line[i] === 'TEMPO' || line[i] === 'FERMATA' || line[i] === 'LABEL' || line[i] === 'END') {
        const prev = line[i - 1];
        // if previous entry is pipe without beat number, default to one
        if (prev === '|') {
          line[i - 1] += '1';
        }

        // console.log(prevBeat);

        if (/^\|[0-9]*/.test(prev) === false) {
          let prevBeat = '|1'; // default
          // look for the first beat info before the command
          // e.g. BAR 3 [4/4] |2 TEMPO 60 FERMATA
          for (let j = i - 1; j >= 0; j--) {
            if (/^\|[0-9\.]*/.test(line[j])) {
              prevBeat = line[j];
              break;
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
 *     signature: null || BarSignature {
 *       upper: Number=4
 *       lower: Number=4
 *     },
 *     units: null || UnitsSignature {}
 *     duration: null,
 *   }
 *   {
 *     type: 'TEMPO'
 *     bar: Integer=1,
 *     beat: Float=1,
 *
 *     basis: null || TempoBasisSignature {
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

  // each bar is defined on 1 line now
  const lines = formattedScore.split('\n');
  const ir = [];

  lines.forEach((line, index) => {
    const parts = line
      .split('|')
      .map(parts => parts.trim())
      .map(parts => parts.split(splitWordsRegexp).map(word => word.trim()));

    // first element is the bar definition
    // e.g.: BAR 1 [4/4]
    // @todo - handle units, e.g. BAR 1 [6/8] UNITS [1/6]
    const bar = parts.shift();

    // parse bar
    const event = {
      type: 'BAR',
      bar: null,
      beat: 1,
      signature: null,
      units: null,
      duration: null,
      // for usage in error messages
      source: line,
    };

    // > index 1 must be bar number
    const currentBar = parseInt(bar[1]);

    if (Number.isNaN(currentBar) || currentBar < 1) {
      throw new Error(`Invalid syntax for BAR in line "${line}", bar number is not a number or is below 1`);
    }

    event.bar = currentBar;

    // > index 2, if present is duration or signature
    if (bar[2] !== undefined) {
      if (barSignatureRegexp.test(bar[2])) {
        event.signature = barSignature(bar[2]);
      } else if (absDurationRegexp.test(bar[2])) {
        event.duration = barDuration(bar[2]);
      } else {
        throw new Error(`Invalid syntax for BAR in line "${line}", invalid signature or duration`);
      }
    } else if (index === 0) {
      throw new Error(`Invalid syntax for BAR in line "${line}", first bar must define a signature or a duration`);
    }

    // @todo - handle UNITS syntax here to override defaults
    if (event.signature !== null) {
      const defaultUnits = event.signature.defaultUnits;
      event.units = unitsSignature(defaultUnits);

      // sanity check units against signature
      const barValue = event.signature.upper / event.signature.lower;
      const unitsValue = event.units.upper.reduce((acc, value) => acc + value, 0) / event.units.lower;

      if (Math.abs(barValue - unitsValue) > 1e-6) {
        throw new Error(`Invalid units definition, bar and units are not consistent`);
      }
    }

    ir.push(event);

    // parse other events for this bar
    parts.forEach(part => {
      const event = {
        type: part[1],
        bar: currentBar,
        beat: parseFloat(part[0]),
        source: line,
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

          if (fermataSyntaxRegexp.test(value)) {
            const parts = value.split('=');
            event.basis = tempoBasisSignature(parts[0]);

            if (parts[1] === '?') {
              event.suspended = true;
            } else if (parts[1].endsWith('*')) {
              event.relDuration = parseFloat(parts[1].replace('*', ''));
            } else {
              event.absDuration = barDuration(parts[1]);
            }
          } else {
            throw new Error(`Invalid syntax for FERMATA in line: ${line}`);
          }
          break;
        case 'TEMPO':
          // tempo equivalence syntax
          if (tempoEquivalenceRegexp.test(part[2])) {
            // find last tempo and last tempo signature
            let lastBPM = null;
            let lastTempoSignature = null;

            for (let i = ir.length - 1; i >= 0; i--) {
              let event = ir[i];

              if (event.type === 'TEMPO') {
                // bpm is mandatory in TEMPO definition
                lastBPM = event.bpm;

                if (event.signature) {
                  lastTempoSignature = tempoBasisSignature(event.basis.value);
                }
              }
            }

            // @todo - review when tempo is more solid
            if (lastTempoSignature === null) {
              lastTempoSignature = tempoBasisSignature('[1/4]');
            }

            const newUnitEq = part[2].replace(/\=\[[0-9]+\/[0-9]+\]/, '');
            const lastUnitEq = part[2].replace(/\[[0-9]+\/[0-9]+\]\=/, '');

            const lastUnitEqSignature = tempoBasisSignature(lastUnitEq);
            // ratio betwen the last defined signature and signature before convertion
            const tempoRatio = (lastTempoSignature.upper / lastTempoSignature.lower) /
              (lastUnitEqSignature.upper / lastUnitEqSignature.lower);

            event.bpm = lastBPM * tempoRatio;
            event.basis = tempoBasisSignature(newUnitEq);
            event.basisEquivalency = true;

          // normal syntax
          } else if (tempoSyntaxRegexp.test(part[2])) {
            const [basis, bpm] = part[2].split('=');

            event.bpm = parseFloat(bpm);
            event.basis = tempoBasisSignature(basis);
            event.basisEquivalency = false;
          } else {
            throw new Error(`Invalid syntax for TEMPO signature in line: ${line}`)
          }

          if (part[3] === 'curve') {
            let exponent = 1; // linear ramp

            if (part[4] !== undefined) {
              exponent = parseFloat(part[4]);
            }

            if (Number.isNaN(exponent)) {
              throw new Error(`Invalid syntax for TEMPO curve in line: ${line}`);
            }

            event.bpmCurve = exponent;
          }
          break;
        case 'END': {
          // nothing to do, `event.type: 'END'`` is enougth
          break;
        }
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

function insertEventInList(event, list, source) {
  if (event.duration === null && event.signature === null) {
    throw new Error(`Invalid bar definition: a bar should have a either a duration or a signature defined: "${source}"`);
  }

  if (event.signature !== null && event.tempo === null) {
    throw new Error(`Invalid bar definition: a bar with a signature should have a tempo defined: "${source}"`);
  }

  list.push(cloneDeep(event));
}

/**
 * Return a list of states according to events
 * ```
 * const events = [
 *   {
 *     bar: Integer,
 *     beat: Float,
 *     signature: BarSignature { upper: Integer, lower: Number },
 *     // units is only defined if signature is defined
 *     units: UnitsSignature { upper: Array<Integer>, lower: Number }
 *     // is a duration is set, it takes precedance over tempo
 *     duration: null || Number
 *     tempo: null || {
 *       basis: TempoBasisSignature { upper: Integer, lower: Number },
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
  if (!isString(score)) {
    throw new Error(`Invalid soap score, ${score} is not a string`);
  }

  const ir = getEventList(score);
  const list = [];

  let currentEvent = {
    // init with first event infos
    bar: ir[0].bar,
    beat: ir[0].beat,
    signature: null,
    units: null,
    duration: null,
    tempo: null,
    fermata: null,
    label: null,
  };

  let source = ir[0].source;

  function insertEndFermata(currentEvent) {
    insertEventInList(currentEvent, list, source);

    const fermataBasis = currentEvent.fermata.basis;
    const tempoBasis = currentEvent.tempo.basis;
    const signature = currentEvent.signature;
    // compute position of next event according to fermata basis
    // express fermata basis according to tempo basis
    const tempoRatio = tempoBasis.upper / tempoBasis.lower;
    const relBasis = (fermataBasis.upper / fermataBasis.lower) / tempoRatio;

    currentEvent.beat += relBasis;

    // fermata should end at most at the end of the current bar
    if (currentEvent.beat * tempoRatio > (signature.upper / signature.lower)) {
      currentEvent.bar += 1;
      currentEvent.beat = 1;
    }

    // reset fermata to null
    currentEvent.fermata = null;
  }

  for (let index = 0; index < ir.length; index++) {
    let event = ir[index];

    if (event.bar !== currentEvent.bar || event.beat !== currentEvent.beat) {
      if (currentEvent.end === true) {
        throw new Error(`Cannot parse event after end`);
      }

      // store current event
      insertEventInList(currentEvent, list, source);
      // deep copy current event and re-initialize
      currentEvent.bar = event.bar;
      currentEvent.beat = event.beat;
      // reset field that are not persisted
      currentEvent.label = null;
      currentEvent.fermata = null;
      // keep other fields untouched,
      // - `tempo.curve` is reset to null when only needed
      // - `duration` is reset to null only when a signature is set

      // for cleaner error messages
      source = event.source;
    }

    switch (event.type) {
      case 'BAR':
        if (event.signature) {
          currentEvent.duration = null;
          currentEvent.signature = event.signature;
          currentEvent.units = event.units;
        }

        if (event.duration) {
          currentEvent.duration = event.duration;
        }
        break;
      case 'TEMPO':
        // these are mandatory in getEventList
        if (currentEvent.tempo === null) {
          currentEvent.tempo = {};
        }

        currentEvent.tempo.basis = event.basis;
        // always store bpm, as a unit equivalency can change duration of the
        // unit basis and they are allowed in curves
        currentEvent.tempo.bpm = event.bpm;

        // handle curve
        if (event.bpmCurve) {
          const start = {
            bar: event.bar,
            beat: event.beat,
            bpm: event.bpm,
          };
          // find next TEMPO event in list
          let nextTempoEvent = null;

          for (let j = index + 1; j < ir.length; j++) {
            // tempo definition with unit equivalence, e.g. [3/8]=[1/4], are not
            // considered as a curve end
            if (ir[j].type === 'TEMPO' && ir[j].basisEquivalency === false) {
              nextTempoEvent = ir[j];
              break;
            }
          }

          if (nextTempoEvent === null) {
            throw new Error(`Tempo curve has no end`);
          }

          const end = {
            bar: nextTempoEvent.bar,
            beat: nextTempoEvent.beat,
            bpm: nextTempoEvent.bpm,
          };
          const exponent = event.bpmCurve;

          currentEvent.tempo.curve = { start, end, exponent };
        // reset curve if needed, unit equivalencies are allowed inside curves
        } else if (event.basisEquivalency === false) {
          currentEvent.tempo.curve = null;
        }
        break;
      case 'FERMATA':
        currentEvent.fermata = {
          basis: null,
          absDuration: null,
          relDuration: null,
          suspended: null
        };

        currentEvent.fermata.basis = event.basis;

        if ('absDuration' in event) {
          currentEvent.fermata.absDuration = event.absDuration;
        }

        if ('relDuration' in event) {
          currentEvent.fermata.relDuration = event.relDuration;
        }

        if ('suspended' in event) {
          currentEvent.fermata.suspended = event.suspended;
        }

        insertEndFermata(currentEvent);
        break;
      case 'LABEL':
        currentEvent.label = event.label;
        break;
      case 'END':
        currentEvent.end = true;
        break;
    }
  }
  // push last event into list
  insertEventInList(currentEvent, list, source);

  return list;
}
