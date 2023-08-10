import { assert } from 'chai';
import SoapScoreInterpreter from '../src/SoapScoreInterpreter.js';

describe('SoapScoreInterpreter#getLocationAtPosition(position)', () => {
  describe('## simple', () => {
    it('BAR 1 [4/4] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(2);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 1, beat: 4 });
      }
      {
        const location = interpreter.getLocationAtPosition(4);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [4/4] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(2);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 1, beat: 4 });
      }
      {
        const location = interpreter.getLocationAtPosition(4);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [4/4] TEMPO [1/2]=30', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/2]=30
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(2);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 1, beat: 4 });
      }
      {
        const location = interpreter.getLocationAtPosition(4);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [3/4] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [3/4] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(2);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [2/2] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [2/2] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(2);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(4);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });


    it('BAR 1 [5/2] TEMPO [1/4]=120', () => {
      const score = `
        BAR 1 [5/2] TEMPO [1/4]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(2);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 1, beat: 4 });
      }
      {
        const location = interpreter.getLocationAtPosition(4);
        assert.deepEqual(location, { bar: 1, beat: 5 });
      }
      {
        const location = interpreter.getLocationAtPosition(5);
        assert.deepEqual(location, { bar: 2, beat: 1 });
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
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(2);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [6/8] TEMPO [1/8]=60', () => {
      const score = `
        BAR 1 [6/8] TEMPO [1/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(6);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [6/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [6/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1.5);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [3/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [3/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1.5);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [9/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [9/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1.5);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(4.5);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [12/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [12/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1.5);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(3);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(4.5);
        assert.deepEqual(location, { bar: 1, beat: 4 });
      }
      {
        const location = interpreter.getLocationAtPosition(6);
        assert.deepEqual(location, { bar: 2, beat: 1 });
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
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(1.66666666);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [2/8] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [2/8] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    });

    it('BAR 1 [4/16] TEMPO [1/4]=60', () => {
      // this is a 2 beats bar: [2/16][2/16] (compound rules are applied as for x/8)
      const score = `
        BAR 1 [4/16] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(0.5);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(1);
        assert.deepEqual(location, { bar: 2, beat: 1 });
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
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(0.666666);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(1.666666);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(2.333333);
        assert.deepEqual(location, { bar: 2, beat: 1 });
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
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(5);
        assert.deepEqual(location, { bar: 1, beat: 1.5 });
      }
      {
        const location = interpreter.getLocationAtPosition(10);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(20);
        assert.deepEqual(location, { bar: 3, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(25);
        assert.deepEqual(location, { bar: 4, beat: 1 });
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
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        // first
        const location = interpreter.getLocationAtPosition(60 / 72);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(60 / 72 + 60 / 84);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const location = interpreter.getLocationAtPosition(60 / 72 + 60 / 84 + 60 / 96);
        assert.deepEqual(location, { bar: 1, beat: 4 });
      }
      {
        const location = interpreter.getLocationAtPosition(60 / 72 + 60 / 84 + 60 / 96 + 60 / 108);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
      {
        const location = interpreter.getLocationAtPosition(60 / 72 + 60 / 84 + 60 / 96 + 60 / 108 + 60 / 120);
        assert.deepEqual(location, { bar: 2, beat: 2 });
      }
      {
        const location = interpreter.getLocationAtPosition(60 / 72 + (60 / 84) * 0.5);
        assert.deepEqual(location, { bar: 1, beat: 2.5 });
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
        const location = interpreter.getLocationAtPosition(0);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }
      {
        const target = 60 / 90;
        const location = interpreter.getLocationAtPosition(target);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }
      {
        const target = 60 / 90 + (60 / 120) * 2/3;
        const location = interpreter.getLocationAtPosition(target);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }
      {
        const target = 60 / 90 + (60 / 120) * 2/3 + (60 / 140) * 2/3;
        const location = interpreter.getLocationAtPosition(target);
        assert.deepEqual(location, { bar: 2, beat: 1 });
      }
    })
  });

  describe('## curve mixed', () => {});
});
