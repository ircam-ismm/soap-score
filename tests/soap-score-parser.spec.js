import path from 'node:path';
import fs from 'node:fs';

import { assert } from 'chai';
import parseDuration from 'parse-duration';

import { soapScoreParser, soapFormatScore } from '../src/soap-score-parser.js';

describe('soapScoreParser', () => {
  describe('soapFormatScore (private)', () => {
    it('should clean the given score', () => {
      // the score is invalid but ok for testing
      const score = `
// first comments

//comment without space
 BAR [4/4] // test
      `;
      const parsed = soapFormatScore(score);

      const expected = 'BAR [4/4]';
      assert.equal(parsed, expected); // deepEqual
    });

    it('should thow if line begin with something else than "BAR" or "|"', () => {
      const score = `
BAR [4/4]
2 TEMPO 60
      `;

      assert.throw(() => {
        soapFormatScore(score);
      });
    });

    it('should pack lines to have only lines starting with "BAR"', () => {
      const score = `
BAR [4/4]
|2 TEMPO 60
      `;
      const parsed = soapFormatScore(score);

      const expected = 'BAR [4/4] |2 TEMPO 60';
      assert.equal(parsed, expected);
    });

    it('should add default beat when packing lines', () => {
      const score = `
BAR [4/4]
| TEMPO 60
      `;
      const parsed = soapFormatScore(score);

      const expected = 'BAR [4/4] |1 TEMPO 60';
      assert.equal(parsed, expected);
    });

    it('should insert beat info (i.e. "|1") before COMMAND if missing', () => {
      {
        const score = `BAR [4/4] TEMPO 60`;
        const parsed = soapFormatScore(score);

        const expected = 'BAR [4/4] |1 TEMPO 60';
        assert.equal(parsed, expected);
      }

      {
        const score = `BAR [4/4] | FERMATA`;
        const parsed = soapFormatScore(score);

        const expected = 'BAR [4/4] |1 FERMATA';
        assert.equal(parsed, expected);
      }

      { // this one should be kept untouched
        const score = `BAR [4/4] |2 TEMPO 60`;
        const parsed = soapFormatScore(score);

        const expected = 'BAR [4/4] |2 TEMPO 60';
        assert.equal(parsed, expected);
      }
    });

    it('should insert beat info (i.e. "|x") before COMMAND according to previous beat', () => {
      {
        const score = 'BAR 3 [4/4] TEMPO 60 FERMATA';
        const parsed = soapFormatScore(score);

        const expected = `BAR 3 [4/4] |1 TEMPO 60 |1 FERMATA`;
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] |2 TEMPO 60 FERMATA';
        const parsed = soapFormatScore(score);

        const expected = `BAR 3 [4/4] |2 TEMPO 60 |2 FERMATA`;
        assert.equal(parsed, expected);
      }
    });

    it('should properly insert LABEL command', () => {
      {
        const score = 'BAR 3 [4/4] " cou cou "';
        const parsed = soapFormatScore(score);

        const expected = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] | LABEL " cou cou "';
        const parsed = soapFormatScore(score);

        const expected = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        const parsed = soapFormatScore(score);

        const expected = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] |4 TEMPO 60 " cou cou "';
        const parsed = soapFormatScore(score);

        const expected = 'BAR 3 [4/4] |4 TEMPO 60 |4 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }
    });

    it('should accept (a long and complicated) file', () => {
      const filename = path.join(process.cwd(), 'syntax-proposal.soap');
      const score = fs.readFileSync(filename).toString();

      try {
        const parsed = soapFormatScore(score);
      } catch(err) {
        console.log(err);
        assert.fail();
      }
    });
  });

  describe('test regexps', () => {
    it('should test signature syntax properly', () => {
      const re = /\[[0-9\+]+\/[0-9]+\]/;

      assert.equal(re.test('[3/4]'), true);
      assert.equal(re.test('[2+3/4]'), true);
      assert.equal(re.test('[2+2+3/4]'), true);
    });

    it('should test absolute durations syntax properly', () => {
      const re = /\[[0-9hms]+\]/;

      assert.equal(re.test('[3s]'), true);
      assert.equal(re.test('[2m3s]'), true);
      assert.equal(re.test('[2h3m4s500ms]'), true);
      assert.equal(re.test('[2h3m4s500]'), true);

      assert.equal(re.test('[4t]'), false);
      assert.equal(re.test('[2b3m]'), false);
    });

    it('should catch timing syntax properly', () => {
      // this is a catch that should be used after the valid syntax regexps
      const re = /\[.*\]/;

      assert.equal(re.test('[12/ldk qmzdk]'), true);
    });

    it('shoud test tempo equivalence syntax properly', () => {
      const re = /\[[0-9]+\/[0-9]+\]\-\>\[[0-9]+\/[0-9]+\]/;

      assert.equal(re.test('[1/2]->[1/8]'), true);
      assert.equal(re.test('[1/2]>[1/8]'), false);
      assert.equal(re.test('coucou>[1/8]'), false);
    });
  })

  describe('create event model', () => {
    it('should parse BAR correctly', () => {
      {
        const score = `BAR [4/4]`;
        const ir = soapScoreParser(score);
        const expected = [{
          type: 'BAR',
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
        }];
        assert.deepEqual(ir, expected);
      }

      {
        const score = `BAR 2 [3/4]`;
        const ir = soapScoreParser(score);
        const expected = [{
          type: 'BAR',
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
        }];
        assert.deepEqual(ir, expected);
      }

      {
        const score = `BAR 19 [2s500ms]`;
        const ir = soapScoreParser(score);
        const expected = [{
          type: 'BAR',
          bar: 19,
          beat: 1,
          duration: 2.5,
        }];
        assert.deepEqual(ir, expected);
      }
    });

    it('should parse other keywords correctly', () => {
      const score = `BAR 12 [2+2+3/8] |1 LABEL "cou cou" |2 TEMPO 60 [1/8] |3 FERMATA [2s]`;
      const ir = soapScoreParser(score);
      const expected = [
        {
          type: 'BAR',
          beat: 1,
          signature: {
            empty: false,
            name: '2+2+3/8',
            type: 'irregular',
            upper: 7,
            lower: 8,
            additive: [2, 2, 3],
          },
          bar: 12
        },
        { type: 'LABEL', bar: 12, beat: 1 },
        {
          type: 'TEMPO',
          bar: 12,
          beat: 2,
          bpm: 60,
          signature: {
            empty: false,
            name: '1/8',
            type: 'irregular',
            upper: 1,
            lower: 8,
            additive: [],
          }
        },
        { type: 'FERMATA', bar: 12, beat: 3, duration: 2000 }
      ];

      assert.deepEqual(ir, expected);
    });

    it('should handle tempo equivalences properly', () => {
      const score = `
        BAR 200 [6/8] TEMPO 60 [3/8]
        // quarter note of 6/8 = quarter note of 3/4
        BAR 201 [3/4] TEMPO [1/4]->[1/4]
      `;
      const ir = soapScoreParser(score);

      // test score
      const scoreTest = `
        BAR 200 [6/8] TEMPO 60 [3/8]
        // quarter note in 6/8 = quarter note in 3/4
        BAR 201 [3/4] TEMPO 90 [1/4]
      `;
      const expected = soapScoreParser(score);

      assert.deepEqual(ir, expected);
    });
  });
});
