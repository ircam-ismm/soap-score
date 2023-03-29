import { assert } from 'chai';

import {
  getEventList,
  formatScore,
  // regexps
  signatureRegexp,
  absDurationRegexp,
  bracketDefaultRegExp,
  tempoEquivalenceRegexp,
  tempoSyntaxRegexp,
  fermataSyntaxRegexp,
} from '../src/soap-score-parser.js';

describe('> soap parseScore internals', () => {
  describe('[internal] test regexps', () => {
    it('should test signature syntax properly', () => {
      assert.equal(signatureRegexp.test('[3/4]'), true);
      assert.equal(signatureRegexp.test('[2+3/4]'), true);
      assert.equal(signatureRegexp.test('[2+2+3/4]'), true);
    });

    it('should test absolute durations syntax properly', () => {
      assert.equal(absDurationRegexp.test('3s'), true);
      assert.equal(absDurationRegexp.test('2m3s'), true);
      assert.equal(absDurationRegexp.test('2h3m4s500ms'), true);
      assert.equal(absDurationRegexp.test('2h3m4s500'), true);

      assert.equal(absDurationRegexp.test('4t'), false);
      assert.equal(absDurationRegexp.test('2b3m'), false);
    });

    it('should catch timing syntax properly', () => {
      // this is a catch that should be used after the valid syntax regexps
      assert.equal(bracketDefaultRegExp.test('[12/ldk qmzdk]'), true);
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
        const ir = getEventList(score);
        const expected = [{
          type: 'BAR',
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
        }];
        assert.deepEqual(ir, expected);
      }

      {
        const score = `BAR 19 [2s500ms]`;
        const ir = getEventList(score);
        const expected = [{
          type: 'BAR',
          bar: 19,
          beat: 1,
          duration: 2.5,
          signature: null,
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
          beat: 1,
          duration: null,
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
        { type: 'LABEL', bar: 12, beat: 1, label: "cou cou" },
        {
          type: 'TEMPO',
          bar: 12,
          beat: 2,
          bpm: 60,
          basis: {
            empty: false,
            name: '1/8',
            type: 'irregular',
            upper: 1,
            lower: 8,
            additive: [],
          }
        },
        {
          type: 'FERMATA',
          bar: 12,
          beat: 3,
          absDuration: 2,
          basis: {
            empty: false,
            name: '1/4',
            type: 'simple',
            upper: 1,
            lower: 4,
            additive: [],
          },
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

