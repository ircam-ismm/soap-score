import { assert } from 'chai';

import SoapScoreInterpreter from '../src/SoapScoreInterpreter.js';
import soapScoreParser from '../src/soapScoreParser.js';

describe('SoapScoreInterpreter', () => {
  describe('SoapScoreInterpreter#getPositionAtLocation', () => {
    it('should work with simplest sore', () => {

      const score = soapScoreParser(`
        TEMPO 60
        BAR 1 [4/4]
      `);

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1);
        assert.equal(position, 0);
      }

      // {
      //   const position = interpreter.getPositionAtLocation(1);
      //   assert.equal(position, 0);
      // }
    });

  });
});

