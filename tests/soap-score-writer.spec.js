import path from 'node:path';
import fs from 'node:fs';

import { assert } from 'chai';
import parseDuration from 'parse-duration';

import {
  parseScore,
  getEventList,
  formatScore,
  // regexps
  signatureRegexp,
  absDurationRegexp,
  bracketDefaultRegExp,
  tempoEquivalenceRegexp,
  tempoSyntaxRegexp,
} from '../src/soap-score-parser.js';

import { scoreFromEvent } from '../src/soap-score-writer.js';

describe('soap.writeScore', () => {
    describe('# Basics', () => {
      it(`## Example 1`, () => {
        const events = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 60,
            bpmCurve: null,
            fermata: null,
            label: null,
          },
        ];
        const score = `BAR 1 [4/4] TEMPO [1/4]=60`;
        const data = scoreFromEvent(events);

        console.log(score);
        assert.deepEqual(data, score);
      });

      it(`## Example 2`, () => {
        const score = `BAR 1 [6/8] TEMPO [3/8]=60`;
        const data = parseScore(score);
        const expected = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '6/8',
              type: 'compound',
              upper: 6,
              lower: 8,
              additive: []
            },
            basis: {
              empty: false,
              name: '3/8',
              type: 'compound',
              upper: 3,
              lower: 8,
              additive: []
            },
            bpm: 60,
            bpmCurve: null,
            fermata: null,
            label: null
          }
        ];

        console.log(score);
        assert.deepEqual(data, expected);
      });

      it(`## Example 3`, () => {
        const score = `\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 [6/4]
BAR 4 [4/4] \
`;
        const data = parseScore(score);
        const expected = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: null
          },
          {
            bar: 3,
            beat: 1,
            signature: {
              empty: false,
              name: '6/4',
              type: 'simple',
              upper: 6,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: null
          },
          {
            bar: 4,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: null
          }
        ];

        console.log(score);
        assert.deepEqual(data, expected);
      });

      it(`## Example 4`, () => {
        const score = `\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 TEMPO [1/4]=50 \
`;
        const data = parseScore(score);
        const expected = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: null
          },
          {
            bar: 3,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 50,
            bpmCurve: null,
            fermata: null,
            label: null
          },
        ];

        console.log(score);
        assert.deepEqual(data, expected);
      });

    describe(`# Labels`, () => {
      it(`## Example 1`, () => {
        const score = `\
BAR 1 [4/4] TEMPO [1/4]=120 "section A"
BAR 2 "section B" \
`;
        const data = parseScore(score);
        const expected = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: "section A"
          },
          {
            bar: 2,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: "section B"
          },
        ];

        console.log(score);
        assert.deepEqual(data, expected);
      });

      it(`## Example 2`, () => {
        const score = `\
BAR 1 [4/4] TEMPO [1/4]=120 "section A"
BAR 2 [3/4]
BAR 3 "section B" \
`;
        const data = parseScore(score);
        const expected = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: "section A"
          },
          {
            bar: 2,
            beat: 1,
            signature: {
              empty: false,
              name: '3/4',
              type: 'simple',
              upper: 3,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: null
          },
          {
            bar: 3,
            beat: 1,
            signature: {
              empty: false,
              name: '3/4',
              type: 'simple',
              upper: 3,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: "section B"
          },
        ];

        console.log(score);
        assert.deepEqual(data, expected);
      });
    });

    describe(`# Bar subdivisions`, () => {
      it(`## Example 1`, () => {
        const score = `\
BAR 1 [4/4] TEMPO [1/4]=120 "To Flute"
|3 "To Piccolo" \
`;
        const data = parseScore(score);
        const expected = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: "To Flute"
          },
          {
            bar: 1,
            beat: 3,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: "To Piccolo"
          },
        ];

        console.log(score);
        assert.deepEqual(data, expected);
      });

      it(`## Example 2`, () => {
        const score = `\
BAR 1 [4/4] TEMPO [1/4]=120
|4.5 "accent" \
`;
        const data = parseScore(score);
        const expected = [
          {
            bar: 1,
            beat: 1,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: null,
          },
          {
            bar: 1,
            beat: 4.5,
            signature: {
              empty: false,
              name: '4/4',
              type: 'simple',
              upper: 4,
              lower: 4,
              additive: []
            },
            basis: {
              empty: false,
              name: '1/4',
              type: 'simple',
              upper: 1,
              lower: 4,
              additive: []
            },
            bpm: 120,
            bpmCurve: null,
            fermata: null,
            label: "accent"
          },
        ];

        console.log(score);
        assert.deepEqual(data, expected);
      });

      it(`## Tips 1`, () => {
        const score1 = `\
BAR 1 [4/4]
| TEMPO [1/4]=120 \
`;
        const data1 = parseScore(score1);

        const score2 = `\
BAR 1 [4/4]
|1 TEMPO [1/4]=120 \
`;
        const data2 = parseScore(score2);

        const score3 = `\
BAR 1 [4/4] TEMPO [1/4]=120 \
`;
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
        const score1 = `\
BAR 1 [4/4]
| TEMPO [1/4]=120
| "début du morceau" \
`;
        const data1 = parseScore(score1);

        const score2 = `\
BAR 1 [4/4]
| TEMPO [1/4]=120 "début du morceau" \
`;
        const data2 = parseScore(score2);

        console.log(score1);
        console.log('> is equivalent to:');
        console.log(score2);

        assert.deepEqual(data1, data2);
      });
    });

    describe('# Contraints', () => {
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
});