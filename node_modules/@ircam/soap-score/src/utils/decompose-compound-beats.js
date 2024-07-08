/**
 * decompose a given number of beat into x * 3 + y * 2
 * e.g. 2 => 2
 * e.g. 3 => 3
 * e.g. 4 => 2 + 2
 * e.g. 5 => 3 + 2
 * e.g. 6 => 3 + 3
 * e.g. 7 => 3 + 2 + 2
 * e.g. 8 => 3 + 3 + 2
 *
 * @param {number} beats - number of beats to decompose
 * @returns {array} decomposition
 */
export default function decomposeCompoundBeats(beats) {
  if (beats === 1) {
    return [1];
  }

  const result = [];

  while (beats > 0) {
    const remaining = beats - 3;

    if (remaining === 0 || remaining >= 2) {
      result.push(3);
      beats -= 3;
    } else {
      result.push(2);
      beats -= 2;
    }
  }

  return result;
}
