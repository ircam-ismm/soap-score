import { assert } from 'chai';

import { parseScore } from '../src/soap-score-parser.js';

import * as fixtures from './fixtures.js';

describe(`> soap.parseScore(score)`, () => {
  describe('# Basics', () => {
    it(`## Example 1`, () => {
      const score = fixtures.basicExample1Score;
      const expected = fixtures.basicExample1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 2`, () => {
      const score = fixtures.basicExample2Score;
      const expected = fixtures.basicExample2Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 3`, () => {
      const score = fixtures.basicExample3Score;
      const expected = fixtures.basicExample3Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 4`, () => {
      const score = fixtures.basicExample4Score;
      const expected = fixtures.basicExample4Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });
  });

  describe(`# Bars w/ absolute duration`, () => {
    it(`## Example 1`, () => {
      const score = fixtures.absExemple1Score;
      const expected = fixtures.absExemple1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 2`, () => {
      const score = fixtures.absExemple2Score;
      const expected = fixtures.absExemple2Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 3`, () => {
      const score = fixtures.absExemple3Score;
      const expected = fixtures.absExemple3Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });
  });

  describe(`# Labels`, () => {
    it(`## Example 1`, () => {
      const score = fixtures.labelExample1Score;
      const expected = fixtures.labelExample1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 1 bis (with optionnal LABEL keyword)`, () => {
      const score = fixtures.labelExample1bisScore;
      const expected = fixtures.labelExample1bisData;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 2`, () => {
      const score = fixtures.labelExample2Score;
      const expected = fixtures.labelExample2Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });
  });

  describe(`# Bar subdivisions`, () => {
    it(`## Example 1`, () => {
      const score = fixtures.subExample1Score;
      const expected = fixtures.subExample1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 2`, () => {
      const score = fixtures.subExample2Score;
      const expected = fixtures.subExample2Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Tips 1`, () => {
      const score1 = fixtures.subTips1Score1;
      const score2 = fixtures.subTips1Score2;
      const score3 = fixtures.subTips1Score3;

      const data1 = parseScore(score1);
      const data2 = parseScore(score2);
      const data3 = parseScore(score3);

      console.log(score1);
      console.log('> is equivalent to:');
      console.log(score2);
      console.log('> is equivalent to:');
      console.log(score3);

      assert.deepEqual(data1, data2);
      assert.deepEqual(data1, data3);
    });

    it(`## Tips 2`, () => {
      const score1 = fixtures.subTips2Score1;
      const score2 = fixtures.subTips2Score2;

      const data1 = parseScore(score1);
      const data2 = parseScore(score2);

      console.log(score1);
      console.log('> is equivalent to:');
      console.log(score2);

      assert.deepEqual(data1, data2);
    });
  });

  describe('# Fermata', () => {
    it(`## Example 1`, () => {
      const score = fixtures.fermataExample1Score;
      const expected = fixtures.fermataExample1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 2`, () => {
      const score = fixtures.fermataExample2Score;
      const expected = fixtures.fermataExample2Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 3`, () => {
      const score = fixtures.fermataExample3Score;
      const expected = fixtures.fermataExample3Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });
  });

  describe('# Mesures composées', () => {
    it(`## Example 1`, () => {
      const score = fixtures.composedExample1Score;
      const expected = fixtures.composedExample1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });
  });

  describe.only('# Courbes de tempo', () => {
    it(`## Example 1`, () => {
      const score = fixtures.tempoCurveExample1Score;
      const expected = fixtures.tempoCurveExample1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });

    it(`## Example 2`, () => {
      const score = fixtures.tempoCurveExample2Score;
      const expected = fixtures.tempoCurveExample2Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });
  });

  describe(`# Equivalences de tempo`, () => {
    it(`## Example 1`, () => {
      const score = fixtures.tempoEquivalencyExample1Score;
      const expected = fixtures.tempoEquivalencyExample1Data;
      const data = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
    });
  });

  describe('# Contraints', () => {
    it(`#@ should throw if given score is not a string`, () => {
      let errored = false;

      try {
        const data = parseScore(undefined);
      } catch (err) {
        errored = true;
        console.log(err.message);
      }

      if (!errored) {
        assert.fail('should have failed');
      }
    });

    it(`## should fail if first bar has no signature`, () => {
      const score = `BAR 1`;

      let errored = false;

      try {
        const data = parseScore(score);
      } catch (err) {
        errored = true;
        console.log(err.message);
      }

      if (!errored) {
        assert.fail('should have failed');
      }
    });

    it(`## should fail if first bar has no tempo`, () => {
      const score = `BAR (4/4)`;

      let errored = false;

      try {
        const data = parseScore(score);
      } catch (err) {
        errored = true;
        console.log(err.message);
      }

      if (!errored) {
        assert.fail('should have failed');
      }
    });
  });
});
