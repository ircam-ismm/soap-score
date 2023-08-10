import { assert } from 'chai';

import {
  barSignatureRegexp,
  tempoBasisSignatureRegexp,
  absDurationRegexp,
  unitsSignatureRegexp,
  tempoEquivalenceRegexp,
  tempoSyntaxRegexp,
  fermataSyntaxRegexp,
} from '../src/utils/regexp.js';
import decomposeCompoundBeats from '../src/utils/decompose-compound-beats.js';
import {
  barSignature,
  parseDuration,
  unitsSignature,
  tempoBasisSignature,
} from '../src/utils/time-signatures.js';



describe('test syntax regexps', () => {
  it('should test bar signature syntax properly', () => {
    assert.equal(barSignatureRegexp.test('[3/4]'), true);
    assert.equal(barSignatureRegexp.test('[2+3/4]'), true);
    assert.equal(barSignatureRegexp.test('[2+2+3/4]'), true);
  });

  it('should test absolute durations syntax properly', () => {
    assert.equal(absDurationRegexp.test('3s'), true);
    assert.equal(absDurationRegexp.test('2m3s'), true);
    assert.equal(absDurationRegexp.test('2h3m4s500ms'), true);
    assert.equal(absDurationRegexp.test('2h3m4s500'), true);

    assert.equal(absDurationRegexp.test('4t'), false);
    assert.equal(absDurationRegexp.test('2b3m'), false);
  });

  it('should test units signature syntax properly', () => {
    assert.equal(unitsSignatureRegexp.test('[1/4]'), true);
    assert.equal(unitsSignatureRegexp.test('[1/4][1/4]'), true);

    assert.equal(unitsSignatureRegexp.test('[1+1/4][1/4]'), false);
    assert.equal(unitsSignatureRegexp.test(''), false);
    assert.equal(unitsSignatureRegexp.test('[1/4][1/4'), false);
  });

  it('should test tempo signature syntax properly', () => {
    assert.equal(tempoBasisSignatureRegexp.test('[3/4]'), true);
    assert.equal(tempoBasisSignatureRegexp.test('[2+3/4]'), false);
    assert.equal(tempoBasisSignatureRegexp.test('[2+2+3/4]'), false);
  });

  it('should test tempo normal syntax properly', () => {
    assert.equal(tempoSyntaxRegexp.test('[1/2]=60'), true);
    assert.equal(tempoSyntaxRegexp.test('[1/2]=60.2'), true);
    assert.equal(tempoEquivalenceRegexp.test('[1/2]=>42'), false);
    assert.equal(tempoEquivalenceRegexp.test('coucou=38'), false);
  });

  it('should test tempo equivalence syntax properly', () => {
    assert.equal(tempoEquivalenceRegexp.test('[1/2]=[1/8]'), true);
    assert.equal(tempoEquivalenceRegexp.test('[1/2]=>[1/8]'), false);
    assert.equal(tempoEquivalenceRegexp.test('coucou>[1/8]'), false);
  });

  it('should test fermata syntax properly', () => {
    assert.equal(fermataSyntaxRegexp.test('[1/2]=10s'), true);
    assert.equal(fermataSyntaxRegexp.test('[1/2]=10.5s'), true);
    assert.equal(fermataSyntaxRegexp.test('[1/2]=2*'), true);
    assert.equal(fermataSyntaxRegexp.test('[1/2]=?'), true);
    assert.equal(fermataSyntaxRegexp.test('[1/2]=3x'), false);
    assert.equal(fermataSyntaxRegexp.test('[1/2]=>?'), false);
    assert.equal(fermataSyntaxRegexp.test('coucou=38'), false);
    assert.equal(fermataSyntaxRegexp.test(undefined), false);
  });
});

describe('decomposeCompoundBeats(beats) -> array', () => {
  it(`test 1`, () => {
    const res = decomposeCompoundBeats(1);
    assert.deepEqual(res, [1]);
  });

  it(`test 2`, () => {
    const res = decomposeCompoundBeats(2);
    assert.deepEqual(res, [2]);
  });

  it(`test 3`, () => {
    const res = decomposeCompoundBeats(3);
    assert.deepEqual(res, [3]);
  });

  it(`test 4`, () => {
    const res = decomposeCompoundBeats(4);
    assert.deepEqual(res, [2, 2]);
  });

  it(`test 5`, () => {
    const res = decomposeCompoundBeats(5);
    assert.deepEqual(res, [3, 2]);
  });

  it(`test 6`, () => {
    const res = decomposeCompoundBeats(6);
    assert.deepEqual(res, [3, 3]);
  });

  it(`test 7`, () => {
    const res = decomposeCompoundBeats(7);
    assert.deepEqual(res, [3, 2, 2]);
  });

  it(`test 8`, () => {
    const res = decomposeCompoundBeats(8);
    assert.deepEqual(res, [3, 3, 2]);
  });

  it(`test 9`, () => {
    const res = decomposeCompoundBeats(9);
    assert.deepEqual(res, [3, 3, 3]);
  });

  it(`test 10`, () => {
    const res = decomposeCompoundBeats(10);
    assert.deepEqual(res, [3, 3, 2, 2]);
  });

  it(`test 11`, () => {
    const res = decomposeCompoundBeats(11);
    assert.deepEqual(res, [3, 3, 3, 2]);
  });

  it(`test 12`, () => {
    const res = decomposeCompoundBeats(12);
    assert.deepEqual(res, [3, 3, 3, 3]);
  });

  it(`test 13`, () => {
    const res = decomposeCompoundBeats(13);
    assert.deepEqual(res, [3, 3, 3, 2, 2]);
  });
});

describe('barSignature(signature)', () => {
  // simple mesures
  it('should throw if invalid', () => {
    assert.throws(() => barSignature('invalid'));
  });

  describe('simple bar signatures', () => {
    it('4/4', () => {
      const expected = {
        value: '[4/4]',
        upper: 4,
        lower: 4,
        defaultUnits: '[1/4][1/4][1/4][1/4]',
      };
      const result = barSignature('[4/4]');
      assert.deepEqual(result, expected);
    });

    it('3/2', () => {
      const expected = {
        value: '[3/2]',
        upper: 3,
        lower: 2,
        defaultUnits: '[1/2][1/2][1/2]',
      };
      const result = barSignature('[3/2]');
      assert.deepEqual(result, expected);
    });

    // exotic signatures
    it('5/6', () => {
      const expected = {
        value: '[5/6]',
        upper: 5,
        lower: 6,
        defaultUnits: '[1/6][1/6][1/6][1/6][1/6]',
      };
      const result = barSignature('[5/6]');
      assert.deepEqual(result, expected);
    });

    it('5/3', () => {
      const expected = {
        value: '[5/3]',
        upper: 5,
        lower: 3,
        defaultUnits: '[1/3][1/3][1/3][1/3][1/3]',
      };
      const result = barSignature('[5/3]');
      assert.deepEqual(result, expected);
    });
  });

  describe('compound/irrational bar signatures', () => {
    it('6/8', () => {
      const expected = {
        value: '[6/8]',
        upper: 6,
        lower: 8,
        defaultUnits: '[3/8][3/8]',
      };
      const result = barSignature('[6/8]');
      assert.deepEqual(result, expected);
    });

    it('7/8', () => {
      const expected = {
        value: '[7/8]',
        upper: 7,
        lower: 8,
        defaultUnits: '[3/8][2/8][2/8]',
      };
      const result = barSignature('[7/8]');
      assert.deepEqual(result, expected);
    });

    it('11/8', () => {
      const expected = {
        value: '[11/8]',
        upper: 11,
        lower: 8,
        defaultUnits: '[3/8][3/8][3/8][2/8]',
      };
      const result = barSignature('[11/8]');
      assert.deepEqual(result, expected);
    });

    // lower 16 acts the same
    it('11/16', () => {
      const expected = {
        value: '[11/16]',
        upper: 11,
        lower: 16,
        defaultUnits: '[3/16][3/16][3/16][2/16]',
      };
      const result = barSignature('[11/16]');
      assert.deepEqual(result, expected);
    });
  });

  describe('additive bar signatures', () => {
    it('2+3+2/8', () => {
      const expected = {
        value: '[2+3+2/8]',
        upper: 7,
        lower: 8,
        defaultUnits: '[2/8][3/8][2/8]',
      };
      const result = barSignature('[2+3+2/8]');
      assert.deepEqual(result, expected);
    });
  });
});

// should be renamed
describe('parseDuration(value)', () => {
  it('12s', () => {
    const expected = 12;
    const result = parseDuration('12s');
    assert.equal(expected, result);
  });

  it('12ms', () => {
    const expected = 12 * 1e-3;
    const result = parseDuration('12ms');
    assert.equal(expected, result);
  });

  it('12m', () => {
    const expected = 12 * 60;
    const result = parseDuration('12m');
    assert.equal(expected, result);
  });

  it('12m5s', () => {
    const expected = 12 * 60 + 5;
    const result = parseDuration('12m5s');
    assert.equal(expected, result);
  });
});

describe('unitsSignature(value)', () => {
  it('[1/4][1/4][1/4][1/4]', () => {
    const expected = {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    };
    const result = unitsSignature('[1/4][1/4][1/4][1/4]');
    assert.deepEqual(expected, result);
  });

  it('[3/4]', () => {
    const expected = {
      value: '[3/4]',
      upper: [3],
      lower: 4,
      numBeats: 1,
    };
    const result = unitsSignature('[3/4]');
    assert.deepEqual(expected, result);
  });

  it('[2/8][3/8][2/8]', () => {
    const expected = {
      value: '[2/8][3/8][2/8]',
      upper: [2, 3, 2],
      lower: 8,
      numBeats: 3,
    };
    const result = unitsSignature('[2/8][3/8][2/8]');
    assert.deepEqual(expected, result);
  });
});

describe('tempoBasisSignature(value)', () => {
  it('[1/4]', () => {
    const expected = {
      value: '[3/4]',
      upper: 3,
      lower: 4,
    };
    const result = tempoBasisSignature('[3/4]');
    assert.deepEqual(expected, result);
  });

  it('[3/8]', () => {
    const expected = {
      value: '[3/8]',
      upper: 3,
      lower: 8,
    };
    const result = tempoBasisSignature('[3/8]');
    assert.deepEqual(expected, result);
  });
});
