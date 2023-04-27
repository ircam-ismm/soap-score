import { assert } from 'chai';
import SoapScoreInterpreter from '../src/SoapScoreInterpreter.js';

describe(`SoapScoreInterpreter.getLocationInfos(bar, beat)`, () => {
  describe(`Simple cases`, () => {
    it('BAR 1 [4/4] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 0, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 2.5);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2.5, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 1.5, 'position');
        assert.equal(duration, 0.5, 'duration');
        assert.equal(dt, 0.5, 'dt');
      }
    });

    it('BAR 1 [6/8] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [6/8] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 0, 'position');
        assert.equal(duration, 1.5, 'duration');
        assert.equal(dt, 1.5, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 2.5);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2.5, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 2.25, 'position');
        assert.equal(duration, 0.75, 'duration');
        assert.equal(dt, 0.75, 'dt');
      }
    });

    it('BAR 1 [5/8] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [5/8] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 0, 'position');
        assert.equal(duration, 1.5, 'duration');
        assert.equal(dt, 1.5, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 2, lower: 8, bpm: 60 }, 'unit');
        assert.equal(position, 1.5, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 2.5);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2.5, 'beat');
        assert.deepEqual(unit, { upper: 2, lower: 8, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 0.5, 'duration');
        assert.equal(dt, 0.5, 'dt');
      }
    });

    it('BAR 1 [2+3/8] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [2+3/8] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 2, lower: 8, bpm: 60 }, 'unit');
        assert.equal(position, 0, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 1, 'position');
        assert.equal(duration, 1.5, 'duration');
        assert.equal(dt, 1.5, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 2.5);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2.5, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 1.75, 'position');
        assert.equal(duration, 0.75, 'duration');
        assert.equal(dt, 0.75, 'dt');
      }
    });

    it('BAR 1 2s', () => {
      const score = `BAR 1 2s`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 1, bpm: 30 }, 'unit');
        assert.equal(position, 0, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, 2, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1.5);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1.5, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 1, bpm: 30 }, 'unit');
        assert.equal(position, 1, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(2, 1);
        assert.equal(bar, 2, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 1, bpm: 30 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, 2, 'dt');
      }
    });
  });

  describe('Events in between beats', () => {
    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |1.5 "label
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |1.5 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 0, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 0.5, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1.5);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1.5, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 0.5, 'position');
        assert.equal(duration, 0.5, 'duration');
        assert.equal(dt, 0.5, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 1, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |1.6 "label
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |1.6 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 0, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 0.6000000000000001, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=120
        |4.5 "label"
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=120
        |4.5 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 4);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 4, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 120 }, 'unit');
        assert.equal(position, 1.5, 'position');
        assert.equal(duration, 0.5, 'duration');
        assert.equal(dt, 0.25, 'dt');
      }
    });
  });

  describe('Fermatas', () => {
    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 3);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 3, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, 10, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=2*
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 3);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 3, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, 4, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=?
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getLocationInfos(1, 3);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 3, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, +Infinity, 'dt');
      }
    });
  });
});


describe(`SoapScoreInterpreter.getLocationInfos(bar, beat)`, () => {
  describe(`Simple cases`, () => {
    it('BAR 1 [4/4] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 1, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }
    });

    it('BAR 1 [6/8] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [6/8] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 1.5, 'position');
        assert.equal(duration, 1.5, 'duration');
        assert.equal(dt, 1.5, 'dt');
      }
    });

    it('BAR 1 [5/8] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [5/8] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 2, lower: 8, bpm: 60 }, 'unit');
        assert.equal(position, 1.5, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 2, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 2.5, 'position');
        assert.equal(duration, 1.5, 'duration');
        assert.equal(dt, 1.5, 'dt');
      }
    });

    it('BAR 1 [2+3/8] TEMPO [1/8]=120', () => {
      const score = `
        BAR 1 [2+3/8] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 3, lower: 8, bpm: 40 }, 'unit');
        assert.equal(position, 1, 'position');
        assert.equal(duration, 1.5, 'duration');
        assert.equal(dt, 1.5, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 2, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 2, lower: 8, bpm: 60 }, 'unit');
        assert.equal(position, 2.5, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }
    });

    it('BAR 1 2s', () => {
      const score = `BAR 1 2s`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 2, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 1, bpm: 30 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, 2, 'dt');
      }
    });
  });

  describe('Events in between beats', () => {
    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |1.5 "label
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |1.5 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1.5, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 0.5, 'position');
        assert.equal(duration, 0.5, 'duration');
        assert.equal(dt, 0.5, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1.5);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 2, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 1, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 3, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |1.6 "label
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |1.6 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 1.6, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 0.6000000000000001, 'position');
        assert.equal(duration, 0.3999999999999999, 'duration');
        assert.equal(dt, 0.3999999999999999, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=120
        |4.5 "label"
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=120
        |4.5 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 4);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 4.5, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 120 }, 'unit');
        assert.equal(position, 1.75, 'position');
        assert.equal(duration, 0.25, 'duration');
        assert.equal(dt, 0.25, 'dt');
      }
    });
  });

  describe('Fermatas', () => {
    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 3, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, 10, 'dt');
      }
      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 3);
        assert.equal(bar, 2, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 4, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=2*
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 3, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, 4, 'dt');
      }
      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 3);
        assert.equal(bar, 2, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 4, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }
    });

    it(`BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
    `, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=?
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar');
        assert.equal(beat, 3, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 2, 'position');
        assert.equal(duration, 2, 'duration');
        assert.equal(dt, +Infinity, 'dt');
      }
      {
        const { bar, beat, unit, position, duration, dt } = interpreter.getNextLocationInfos(1, 3);
        assert.equal(bar, 2, 'bar');
        assert.equal(beat, 1, 'beat');
        assert.deepEqual(unit, { upper: 1, lower: 4, bpm: 60 }, 'unit');
        assert.equal(position, 4, 'position');
        assert.equal(duration, 1, 'duration');
        assert.equal(dt, 1, 'dt');
      }
    });
  });
});
