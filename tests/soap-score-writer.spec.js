import { assert } from 'chai';

import { parseScore } from '../src/soap-score-parser.js';
import { writeScore } from '../src/soap-score-writer.js';

import * as fixtures from './fixtures.js';

describe('soap.writeScore', () => {
    describe('# Basics', () => {
      it(`## Example 1`, () => {
        const data = fixtures.basicExample1Data;

        const score = writeScore(data);
        const expected = parseScore(score);

        assert.deepEqual(data, expected);
      });
      it(`## Example 2`, () => {
        const data = fixtures.basicExample2Data;

        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);

      });
      it(`## Example 3`, () => {
        const data = fixtures.basicExample3Data;

        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);
    });
      it(`## Example 4`, () => {
        const data = fixtures.basicExample4Data;

        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);
      });
    });
    describe('# Absolute measures', () => {
      it('# Example 1', () => {
        const data = fixtures.absExemple1Data;
        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);
      });
      it('# Example 2', () => {
        const data = fixtures.absExemple2Data;
        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);
      })
    })
    describe('# Labels', () => {
      it(`## Example 1`, () => {
        const data = fixtures.labelExample1Data;
        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);

      });
      it(`## Example 2`, () => {
        const data = fixtures.labelExample2Data;

        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);

      });
    });
    describe('# Bar Subdivisions', () => {
      it(`## Example 1`, () => {
        const data = fixtures.subExample1Data;
        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);



      });
      it(`## Example 2`, () => {
        const data = fixtures.subExample2Data;

        const score = writeScore(data);
        const expected = parseScore(score);
        console.log(score);
        assert.deepEqual(data, expected);



      });
    });
    describe('# Fermata', () => {
      it(`## Example 1`, () => {
        const data = fixtures.fermataExample1Data;
        const score = writeScore(data);
        const expected = parseScore(score);
        console.log(score);
        assert.deepEqual(data, expected);
      });
      it(`## Example 2`, () => {
        const data = fixtures.fermataExample2Data;
        const score = writeScore(data);
        const expected = parseScore(score);
        console.log(score);
        assert.deepEqual(data, expected);
      });
      it(`## Example 3`, () => {
        const data = fixtures.fermataExample3Data;
        const score = writeScore(data);
        const expected = parseScore(score);
        console.log(score);
        assert.deepEqual(data, expected);
      });
    });
    describe('# CHIFFRAGE A NUMERATEUR MULTIPLES', () => {
      it('## Example 1', () => {
        const data = fixtures.composedExample1Data;
        const score = writeScore(data);
        const expected = parseScore(score);
        console.log(score);
        assert.deepEqual(data, expected);
      });
    });
    describe('# Tempo Curves', () => {
      it('## Example 1', () => {
        const data = fixtures.tempoCurveExample1Data;
        const score = writeScore(data);
        const expected = parseScore(score);
        console.log(score);
        assert.deepEqual(data, expected);
      });
    });
});
