import { default as _parseDuration } from 'parse-duration';

import {
  barSignatureRegexp,
  absDurationRegexp,
  unitsSignatureRegexp,
  tempoBasisSignatureRegexp,
} from './regexp.js';
import decomposeCompoundBeats from './decompose-compound-beats.js';

// input: [2+3+2/8]
// output: MeasureSignature: {
//   value: '[2+3+2/8]',
//   upper: 7,
//   lower: 8,
//   defaultUnits: '[2/8][3/8][2/8]',
// }
export function barSignature(str) {
  if (!barSignatureRegexp.test(str)) {
    throw new Error(`Invalid bar signature: ${str}`);
  }

  const value = str;

  // remove leading and trailing square brackets
  str = str.slice(1, -1);
  const parts = str.split('/');
  const lower = parseInt(parts[1]);

  let rawUpper = parts[0];
  let upper;
  let defaultUnits;

  // additive - unit are implicitely defined by signature
  if (rawUpper.includes('+')) {
    const parts = rawUpper.split('+');
    upper = parts.reduce((acc, value) => acc + parseInt(value), 0);
    defaultUnits = parts.map(value => `[${value}/${lower}]`).join('');
  // simple and compound
  } else {
    upper = parseInt(rawUpper);

    if (lower === 8 || lower === 16) {
      // consider this a compound unit signature by default
      const beats = decomposeCompoundBeats(upper);
      defaultUnits = beats.map(value => `[${value}/${lower}]`).join('');
    } else {
      // consider this a simple unit signature by default
      defaultUnits = Array.from(Array(upper)).map(_ => `[1/${lower}]`).join('');
    }
  }

  return { value, upper, lower, defaultUnits };
}
/**
 * Returns a duration in second from a string
 * input: 1m12s
 * output: 72
 * cf. https://www.npmjs.com/package/parse-duration
 */
// @todo - rename is also used for fermatas
export function parseDuration(str) {
  if (!absDurationRegexp.test(str)) {
    throw new Error(`Invalid duration syntax: ${str}`);
  }

  return _parseDuration(str, 's');
}

// UnitsSignature: {
//   value: '[2/8][3/8][2/8]',
//   upper: [2, 3, 2]
//   lower: 8,
//   numBeats: 3,
// }
// @todo - should get the bar signature
export function unitsSignature(str) {
  if (!unitsSignatureRegexp.test(str)) {
    throw new Error(`Invalid units signature: ${str}`);
  }

  const value = str;
  // remove leading and trailing square brackets
  str = str.slice(1, -1);
  const rawUnits = str.split('][');

  let upper = [];
  let lower = null;;

  rawUnits.forEach((unit) => {
    const parts = unit.split('/');
    const unitUpper = parseInt(parts[0]);
    const unitLower = parseInt(parts[1]);

    if (lower !== null && lower != unitLower) {
      throw new Error(`Invalid units signature syntax: ${value}, lower values should be consistent`);
    }

    upper.push(unitUpper);
    lower = unitLower;
  });

  const numBeats = upper.length;

  return { value, upper, lower, numBeats };

  // check that all lower parts are consistant
}

// input: [1/4]
// output: TempoBasisSignature: {
//   value: '[3/8]',
//   upper: 3
//   lower: 8,
// }
export function tempoBasisSignature(str) {
  if (!tempoBasisSignatureRegexp.test(str)) {
    throw new Error(`Invalid tempo signature: ${str}`);
  }

  const value = str;
  // remove leading and trailing square brackets
  str = str.slice(1, -1);
  const parts = str.split('/');
  const upper = parseInt(parts[0]);
  const lower = parseInt(parts[1]);

  return { value, upper, lower };
}
