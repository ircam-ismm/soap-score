import path from 'node:path';
import fs from 'node:fs';

import { assert } from 'chai';
import parseDuration from 'parse-duration';

import { parseScore } from '../src/soap-score-parser.js';
import { writeScore } from '../src/soap-score-writer.js';

describe('soap.writeScore', () => {
    describe('# Basics', () => {
      it(`## Example 1`, () => {
        const data = [
          {
            bar: 1,
            beat: 1,
            duration: null,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            tempo: {
              basis: {
                empty: false,
                name: '1/4',
                type: 'simple',
                upper: 1,
                lower: 4,
                additive: []
              },
              bpm: 60,
              curve: null,
            },
            fermata: null,
            label: null,
          },
        ];
        // const score = `BAR 1 [4/4] TEMPO [1/4]=60`;
        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);
      });
      it(`## Example 2`, () => {
        const data = [
          {
            bar: 1,
            beat: 1,
            duration: null,
            signature: {
              empty: false,
              name: '6/8',
              type: 'compound',
              upper: 6,
              lower: 8,
              additive: []
            },
            tempo: {
              basis: {
                empty: false,
                name: '3/8',
                type: 'compound',
                upper: 3,
                lower: 8,
                additive: []
              },
              bpm: 60,
              curve: null,
            },
            fermata: null,
            label: null
          }
        ];

        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);

      });
      it(`## Example 3`, () => {
        const data = [
        {
          bar: 1,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: null
        },
        {
          bar: 3,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '6/4',
            type: 'simple',
            upper: 6,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: null
        },
        {
          bar: 4,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: null
        }
        ];

        const score = writeScore(data);
        const expected = parseScore(score);

        console.log(score);
        assert.deepEqual(data, expected);
    });
      it(`## Example 4`, () => {
      const data = [
        {
          bar: 1,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: null
        },
        {
          bar: 3,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 50,
            curve: null,
          },
          fermata: null,
          label: null
        },
      ];

      const score = writeScore(data);
      const expected = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);
      });
    });
    describe('# Labels', () => {
      it(`## Example 1`, () => {
        const data = [
        {
          bar: 1,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: "section A"
        },
        {
          bar: 2,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: "section B"
        },
      ];

      const score = writeScore(data);
      const expected = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);

      });
      it(`## Example 2`, () => {
      const data = [
        {
          bar: 1,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: "section A"
        },
        {
          bar: 2,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '3/4',
            type: 'simple',
            upper: 3,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: null
        },
        {
          bar: 3,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '3/4',
            type: 'simple',
            upper: 3,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: "section B"
        },
      ];

      const score = writeScore(data);
      const expected = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);

      });
    });
    describe('# Bar Subdivisions', () => {
      it(`## Example 1`, () => {
      const data = [
        {
          bar: 1,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: "To Flute"
        },
        {
          bar: 1,
          beat: 3,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: "To Piccolo"
        },
      ];

      const score = writeScore(data);
      const expected = parseScore(score);

      console.log(score);
      assert.deepEqual(data, expected);



      });
      it(`## Example 2`, () => {
      const data = [
        {
          bar: 1,
          beat: 1,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: null,
        },
        {
          bar: 1,
          beat: 4.5,
          duration: null,
          signature: {
            empty: false,
            name: '4/4',
            type: 'simple',
            upper: 4,
            lower: 4,
            additive: []
          },
          tempo: {
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            curve: null,
          },
          fermata: null,
          label: "accent"
        },
      ];
      const score = writeScore(data);
      const expected = parseScore(score);
      console.log(score);
      assert.deepEqual(data, expected);



      });
    });
    describe('# Fermata', () => {
      it(`## Example`)
    })
});


// const score = writeScore(data);
// const expected = parseScore(score);
// console.log(score);
// assert.deepEqual(data, expected);
