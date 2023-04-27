import { assert } from 'chai';
import SoapScoreInterpreter from '../src/SoapScoreInterpreter.js';

describe('SoapScoreInterpreter#getPositionAtLocation(bar, beat)', () => {
  describe('## simple', () => {
    it('BAR 1 [4/4] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 2);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 4);
        assert.equal(position, 3);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 4);
      }
    });

    it('BAR 1 [4/4] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 2);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 4);
        assert.equal(position, 3);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 4);
      }
    });

    it('BAR 1 [4/4] TEMPO [1/2]=30', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/2]=30
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 2);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 4);
        assert.equal(position, 3);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 4);
      }
    });

    it('BAR 1 [3/4] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [3/4] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 2);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 3);
      }
    });

    it('BAR 1 [2/2] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [2/2] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 2);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 4);
      }
    });


    it('BAR 1 [5/2] TEMPO [1/4]=120', () => {
      const score = `
        BAR 1 [5/2] TEMPO [1/4]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 2);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 4);
        assert.equal(position, 3);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 5);
        assert.equal(position, 4);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 5);
      }
    });
  });

  describe('## compound', () => {
    it('BAR 1 [6/8] TEMPO [3/8]=60', () => {
      const score = `
        BAR 1 [6/8] TEMPO [3/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 2);
      }
    });

    it('BAR 1 [6/8] TEMPO [1/8]=60', () => {
      const score = `
        BAR 1 [6/8] TEMPO [1/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 3);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 6);
      }
    });

    it('BAR 1 [6/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [6/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1.5);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 3);
      }
    });

    it('BAR 1 [3/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [3/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 1.5);
      }
    });

    it('BAR 1 [9/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [9/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1.5);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 3);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 4.5);
      }
    });

    it('BAR 1 [12/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [12/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1.5);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 3);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 4);
        assert.equal(position, 4.5);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 6);
      }
    });
  });

  describe('## irregular', () => {
    it('BAR 1 [5/8] TEMPO [3/8]=60', () => {
      const score = `
        BAR 1 [5/8] TEMPO [3/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 1);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2.5);
        assert.equal(position, 1.3333333333333335);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 1.6666666666666667);
      }
    });

    it('BAR 1 [2/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [2/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 1);
      }
    });

    it('BAR 1 [4/16] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [4/16] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 0.75);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 1);
      }
    });
  });

  describe('## irregular (additive)', () => {
    it('BAR 1 [2+3+2/8] TEMPO [3/8]=60', () => {
      const score = `
        BAR 1 [2+3+2/8] TEMPO [3/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 0.6666666666666666);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 1.6666666666666667);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 2.3333333333333335);
      }
    });
  });

  describe('## absolute durations', () => {
    it(`BAR 1 10s
        BAR 3 5s`, () => {
      const score = `
        BAR 1 10s
        BAR 3 5s
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }

      {
        const position = interpreter.getPositionAtLocation(1, 1.5);
        assert.equal(position, 5);
      }

      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 10);
      }

      {
        const position = interpreter.getPositionAtLocation(3, 1);
        assert.equal(position, 20);
      }

      {
        const position = interpreter.getPositionAtLocation(4, 1);
        assert.equal(position, 25);
      }
    });
  });


  describe('## curve simple', () => {
    it(`BAR 1 [4/4] TEMPO [1/4]=60 curve 1
        BAR 2 TEMPO [1/4]=120`, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60 curve 1
        BAR 2 TEMPO [1/4]=120
      `;
      // tempi: 72, 84, 96, 108 | 120, 120, 120, ...
      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        // first
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, 60 / 72);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, 60 / 72 + 60 / 84);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 4);
        assert.equal(position, 60 / 72 + 60 / 84 + 60 / 96);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, 60 / 72 + 60 / 84 + 60 / 96 + 60 / 108);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 2);
        assert.equal(position, 60 / 72 + 60 / 84 + 60 / 96 + 60 / 108 + 60 / 120);
      }
      {
        const position = interpreter.getPositionAtLocation(1, 2.5);
        assert.equal(position, 60 / 72 + (60 / 84) * 0.5);
      }
    });
  });


  describe('## curve compound', () => {});

  describe('## curve irregular', () => {});

  describe('## curve irregular (additive)', () => {
    it(`BAR 1 [3+2+2/8] TEMPO [3/8]=60 curve 1
        BAR 2 [3+2+2/8] TEMPO [3/8]=160
    `, () => {
      // use height note so calculations are simple to reason about
      const score = `
        BAR 1 [3+2+2/8] TEMPO [3/8]=60 curve 1
        BAR 2 [3+2+2/8] TEMPO [3/8]=160
      `;
      // tempi are 90, 120, 140 | 160

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1, 1);
        assert.equal(position, 0);
      }
      {
        const target = 60 / 90;
        const position = interpreter.getPositionAtLocation(1, 2);
        assert.equal(position, target);
      }
      {
        const target = 60 / 90 + (60 / 120) * 2/3;
        const position = interpreter.getPositionAtLocation(1, 3);
        assert.equal(position, target);
      }
      {
        const target = 60 / 90 + (60 / 120) * 2/3 + (60 / 140) * 2/3;
        const position = interpreter.getPositionAtLocation(2, 1);
        assert.equal(position, target);
      }
    })
  });

  describe('## curve mixed', () => {});
});
