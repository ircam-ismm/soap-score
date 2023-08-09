import { assert } from 'chai';

import { getEventList, formatScore } from '../src/soap-score-parser.js';

describe('> soap parseScore internals', () => {
  describe('[internal] formatScore(score)', () => {
    it('should clean the given score', () => {
      // the score is invalid but ok for testing
      const score = `
// first comments

//comment without space
 BAR [4/4] // test
      `;
      const parsed = formatScore(score);

      const expected = 'BAR [4/4]';
      assert.equal(parsed, expected); // deepEqual
    });

    it('should thow if line begin with something else than "BAR" or "|"', () => {
      const score = `
BAR [4/4]
2 TEMPO [1/4]=60
      `;

      assert.throw(() => {
        formatScore(score);
      });
    });

    it('should pack lines to have only lines starting with "BAR"', () => {
      const score = `
BAR [4/4]
|2 TEMPO [1/4]=60
      `;
      const parsed = formatScore(score);

      const expected = 'BAR [4/4] |2 TEMPO [1/4]=60';
      assert.equal(parsed, expected);
    });

    it('should add default beat when packing lines', () => {
      const score = `
BAR [4/4]
| TEMPO [1/4]=60
      `;
      const parsed = formatScore(score);

      const expected = 'BAR [4/4] |1 TEMPO [1/4]=60';
      assert.equal(parsed, expected);
    });

    it('should insert beat info (i.e. "|1") before COMMAND if missing', () => {
      {
        const score = `BAR [4/4] TEMPO [1/4]=60`;
        const parsed = formatScore(score);

        const expected = 'BAR [4/4] |1 TEMPO [1/4]=60';
        assert.equal(parsed, expected);
      }

      {
        const score = `BAR [4/4] | FERMATA`;
        const parsed = formatScore(score);

        const expected = 'BAR [4/4] |1 FERMATA';
        assert.equal(parsed, expected);
      }

      { // this one should be kept untouched
        const score = `BAR [4/4] |2 TEMPO [1/4]=60`;
        const parsed = formatScore(score);

        const expected = 'BAR [4/4] |2 TEMPO [1/4]=60';
        assert.equal(parsed, expected);
      }
    });

    it('should insert beat info (i.e. "|x") before COMMAND according to previous beat', () => {
      {
        const score = 'BAR 3 [4/4] TEMPO [1/4]=60 FERMATA';
        const parsed = formatScore(score);

        const expected = `BAR 3 [4/4] |1 TEMPO [1/4]=60 |1 FERMATA`;
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] |2 TEMPO [1/4]=60 FERMATA';
        const parsed = formatScore(score);

        const expected = `BAR 3 [4/4] |2 TEMPO [1/4]=60 |2 FERMATA`;
        assert.equal(parsed, expected);
      }
    });

    it('should properly insert LABEL command', () => {
      {
        const score = 'BAR 3 [4/4] " cou cou "';
        const parsed = formatScore(score);

        const expected = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] | LABEL " cou cou "';
        const parsed = formatScore(score);

        const expected = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        const parsed = formatScore(score);

        const expected = 'BAR 3 [4/4] |1 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] |4 TEMPO [1/4]=60 " cou cou "';
        const parsed = formatScore(score);

        const expected = 'BAR 3 [4/4] |4 TEMPO [1/4]=60 |4 LABEL " cou cou "';
        assert.equal(parsed, expected);
      }
    });
  });

  describe('[internal] getEventList(score)', () => {
    it('should parse BAR correctly', () => {
      {
        const score = `BAR 1 [4/4]`;
        const ir = getEventList(score);
        const expected = [{
          type: 'BAR',
          bar: 1,
          beat: 1,
          duration: null,
          signature: {
            value: '[4/4]',
            upper: 4,
            lower: 4,
            defaultUnits: '[1/4][1/4][1/4][1/4]',
          },
          units: {
            value: '[1/4][1/4][1/4][1/4]',
            upper: [1, 1, 1, 1],
            lower: 4,
            numBeats: 4,
          },
          source: 'BAR 1 [4/4]'
        }];
        assert.deepEqual(ir, expected);
      }

      {
        const score = `BAR 2 [3/4]`;
        const ir = getEventList(score);
        const expected = [{
          type: 'BAR',
          bar: 2,
          beat: 1,
          duration: null,
          signature: {
            value: '[3/4]',
            upper: 3,
            lower: 4,
            defaultUnits: '[1/4][1/4][1/4]',
          },
          units: {
            value: '[1/4][1/4][1/4]',
            upper: [1, 1, 1],
            lower: 4,
            numBeats: 3,
          },
          source: 'BAR 2 [3/4]'
        }];
        assert.deepEqual(ir, expected);
      }

      {
        const score = `BAR 19 2s500ms`;
        const ir = getEventList(score);
        const expected = [{
          type: 'BAR',
          bar: 19,
          beat: 1,
          duration: 2.5,
          signature: null,
          units: null,
          source: 'BAR 19 2s500ms',
        }];
        assert.deepEqual(ir, expected);
      }
    });

    it('should parse other keywords correctly', () => {
      const score = `BAR 12 [2+2+3/8] |1 LABEL "cou cou" |2 TEMPO [1/8]=60 |3 FERMATA [1/4]=2s`;
      const ir = getEventList(score);
      const expected = [
        {
          type: 'BAR',
          bar: 12,
          beat: 1,
          duration: null,
          signature: {
            value: '[2+2+3/8]',
            upper: 7,
            lower: 8,
            defaultUnits: '[2/8][2/8][3/8]',
          },
          units: {
            value: '[2/8][2/8][3/8]',
            upper: [2, 2, 3],
            lower: 8,
            numBeats: 3,
          },
          source: 'BAR 12 [2+2+3/8] |1 LABEL "cou cou" |2 TEMPO [1/8]=60 |3 FERMATA [1/4]=2s',
        },
        {
          type: 'LABEL',
          bar: 12,
          beat: 1,
          label: "cou cou",
          source: 'BAR 12 [2+2+3/8] |1 LABEL "cou cou" |2 TEMPO [1/8]=60 |3 FERMATA [1/4]=2s',
        },
        {
          type: 'TEMPO',
          bar: 12,
          beat: 2,
          bpm: 60,
          basis: {
            value: '[1/8]',
            upper: 1,
            lower: 8,
          },
          basisEquivalence: false,
          source: 'BAR 12 [2+2+3/8] |1 LABEL "cou cou" |2 TEMPO [1/8]=60 |3 FERMATA [1/4]=2s',
        },
        {
          type: 'FERMATA',
          bar: 12,
          beat: 3,
          absDuration: 2,
          basis: {
            value: '[1/4]',
            upper: 1,
            lower: 4,
          },
          source: 'BAR 12 [2+2+3/8] |1 LABEL "cou cou" |2 TEMPO [1/8]=60 |3 FERMATA [1/4]=2s',
        },
      ];

      assert.deepEqual(ir, expected);
    });

    it('should handle tempo equivalences properly', () => {
      const score = `
        BAR 200 [6/8] TEMPO [3/8]=60
        // quarter note of 6/8 = quarter note of 3/4
        BAR 201 [3/4] TEMPO [1/4]=[1/4]
      `;
      const ir = getEventList(score);

      // test score
      const scoreTest = `
        BAR 200 [6/8] TEMPO [3/8]=60
        // quarter note in 6/8 = quarter note in 3/4
        BAR 201 [3/4] TEMPO [1/4]=90
      `;
      const expected = getEventList(score);

      assert.deepEqual(ir, expected);
    });

    it('should fail if tempo definition is incomplete', () => {
      const score = `
        BAR 200 TEMPO 60
      `;

      let errored = false;

      try {
        const ir = getEventList(score);
      } catch(err) {
        errored = true;
        console.log(err.message);
      }

      if (errored === false) {
        assert.fail('should have failed');
      }
    });
  });
});

