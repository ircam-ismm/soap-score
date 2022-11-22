import path from 'node:path';

import { assert } from 'chai';

import soapScoreParser from '../src/soapScoreParser.js';

describe('soapScoreParser', () => {
  describe('check syntax', () => {
    it('should clean the given score', () => {
      // the score is invalid but ok for testing
      const score = `
// first comments

//comment without space
 BAR [4/4] // test
      `;
      const parsed = soapScoreParser(score, true);

      const expected = 'BAR [4/4]';
      assert.equal(parsed, expected);
    });

    it('should thow if line begin with something else than "BAR" or "|"', () => {
      const score = `
BAR [4/4]
2 TEMPO 60
      `;

      assert.throw(() => {
        soapScoreParser(score, true);
      });
    });

    it('should pack lines to have only lines starting with "BAR"', () => {
      const score = `
BAR [4/4]
|2 TEMPO 60
      `;
      const parsed = soapScoreParser(score, true);

      const expected = 'BAR [4/4] |2 TEMPO 60';
      assert.equal(parsed, expected);
    });

    it('should add default beat when packing lines', () => {
      const score = `
BAR [4/4]
| TEMPO 60
      `;
      const parsed = soapScoreParser(score, true);

      const expected = 'BAR [4/4] |1 TEMPO 60';
      assert.equal(parsed, expected);
    });

    it('should insert beat info (i.e. "|1") before COMMAND if missing', () => {
      {
        const score = `BAR [4/4] TEMPO 60`;
        const parsed = soapScoreParser(score, true);

        const expected = 'BAR [4/4] |1 TEMPO 60';
        assert.equal(parsed, expected);
      }

      {
        const score = `BAR [4/4] | FERMATA`;
        const parsed = soapScoreParser(score, true);

        const expected = 'BAR [4/4] |1 FERMATA';
        assert.equal(parsed, expected);
      }

      { // this one should be kept untouched
        const score = `BAR [4/4] |2 TEMPO 60`;
        const parsed = soapScoreParser(score, true);

        const expected = 'BAR [4/4] |2 TEMPO 60';
        assert.equal(parsed, expected);
      }
    });

    it.only('should insert beat info (i.e. "|x") before COMMAND according to previous beat', () => {
      {
        const score = 'BAR 3 [4/4] TEMPO 60 FERMATA';
        const parsed = soapScoreParser(score, true);

        const expected = `BAR 3 [4/4] |1 TEMPO 60 |1 FERMATA`;
        assert.equal(parsed, expected);
      }

      {
        const score = 'BAR 3 [4/4] |2 TEMPO 60 FERMATA';
        const parsed = soapScoreParser(score, true);

        const expected = `BAR 3 [4/4] |2 TEMPO 60 |2 FERMATA`;
        assert.equal(parsed, expected);
      }
    });

    it('should accept (a long and complicated) file', () => {
      const filename = path.join(process.cwd(), 'syntax-proposal.soap');

      try {
        const parsed = soapScoreParser(filename, true);
      } catch(err) {
        console.log(err);
        assert.fail();
      }
    });
  });

  describe('create event model', () => {
    it('test', () => {
      console.log('BAR [4/4] |1 TEMPO 60'.split('|').map(el => el.trim()));
    });
  });
});
