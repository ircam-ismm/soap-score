import { assert } from 'chai';
import SoapScoreInterpreter from '../src/SoapScoreInterpreter.js';

// describe('## _computeBarUnit(event)', () => {
//   describe('simple', () => {
//     it(`BAR 1 [4/4] TEMPO [1/4]=60`, () => {
//       const score = `
//         BAR 1 [4/4] TEMPO [1/4]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 1, 'upper');
//       assert.equal(lower, 4, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });

//     it(`BAR 1 [4/4] TEMPO [1/2]=60`, () => {
//       const score = `
//         BAR 1 [4/4] TEMPO [1/2]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 1, 'upper');
//       assert.equal(lower, 4, 'lower');
//       assert.equal(bpm, 120, 'bpm');
//     });

//     it(`BAR 1 [5/4] TEMPO [1/8]=60`, () => {
//       const score = `
//         BAR 1 [5/4] TEMPO [1/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 1, 'upper');
//       assert.equal(lower, 4, 'lower');
//       assert.equal(bpm, 30, 'bpm');
//     });

//     it(`BAR 1 [2/2] TEMPO [1/4]=60`, () => {
//       const score = `
//         BAR 1 [2/2] TEMPO [1/4]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 1, 'upper');
//       assert.equal(lower, 2, 'lower');
//       assert.equal(bpm, 30, 'bpm');
//     });
//   });

//   describe('compound', () => {
//     it(`BAR 1 [6/8] TEMPO [3/8]=60`, () => {
//       const score = `
//         BAR 1 [6/8] TEMPO [3/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 3, 'upper');
//       assert.equal(lower, 8, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });

//     it(`BAR 1 [6/8] TEMPO [1/8]=180`, () => {
//       const score = `
//         BAR 1 [6/8] TEMPO [1/8]=180
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 3, 'upper');
//       assert.equal(lower, 8, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });

//     it(`BAR 1 [6/8] TEMPO [1/4]=90`, () => {
//       const score = `
//         BAR 1 [6/8] TEMPO [1/4]=90
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 3, 'upper');
//       assert.equal(lower, 8, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });
//   });

//   describe('irregular', () => {
//     it(`BAR 1 [5/8] TEMPO [3/8]=60`, () => {
//       const score = `
//         BAR 1 [5/8] TEMPO [3/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 3, 'upper');
//       assert.equal(lower, 8, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });

//     it(`BAR 1 [5/8] TEMPO [1/8]=180`, () => {
//       const score = `
//         BAR 1 [5/8] TEMPO [1/8]=180
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 3, 'upper');
//       assert.equal(lower, 8, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });
//   });

//   describe('irregular (additive)', () => {
//     it(`BAR 1 [3+2/8] TEMPO [3/8]=60`, () => {
//       const score = `
//         BAR 1 [3+2/8] TEMPO [3/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 3, 'upper');
//       assert.equal(lower, 8, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });

//     it(`BAR 1 [2+3+2/8] TEMPO [1/8]=180`, () => {
//       const score = `
//         BAR 1 [2+3+2/8] TEMPO [1/8]=180
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const { upper, lower, bpm } = interpreter.score[0].unit;

//       assert.equal(upper, 3, 'upper');
//       assert.equal(lower, 8, 'lower');
//       assert.equal(bpm, 60, 'bpm');
//     });
//   });
// });

// describe('## _computeNumBeats(event)', () => {
//   describe('simple', () => {
//     it(`BAR 1 [4/4] TEMPO [1/4]=60`, () => {
//       const score = `
//         BAR 1 [4/4] TEMPO [1/4]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 4, 'numBeats');
//     });

//     it(`BAR 1 [4/4] TEMPO [1/2]=60`, () => {
//       const score = `
//         BAR 1 [4/4] TEMPO [1/2]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 4, 'numBeats');
//     });

//     it(`BAR 1 [5/4] TEMPO [1/8]=60`, () => {
//       const score = `
//         BAR 1 [5/4] TEMPO [1/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 5, 'numBeats');
//     });

//     it(`BAR 1 [2/2] TEMPO [1/4]=60`, () => {
//       const score = `
//         BAR 1 [2/2] TEMPO [1/4]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 2, 'numBeats');
//     });
//   });

//   describe('compound', () => {
//     it(`BAR 1 [6/8] TEMPO [3/8]=60`, () => {
//       const score = `
//         BAR 1 [6/8] TEMPO [3/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 2, 'numBeats');
//     });

//     it(`BAR 1 [3/8] TEMPO [1/8]=180`, () => {
//       const score = `
//         BAR 1 [3/8] TEMPO [1/8]=180
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 1, 'numBeats');
//     });

//     it(`BAR 1 [9/8] TEMPO [1/4]=90`, () => {
//       const score = `
//         BAR 1 [9/8] TEMPO [1/4]=90
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 3, 'numBeats');
//     });
//   });

//   describe('irregular', () => {
//     it(`BAR 1 [5/8] TEMPO [3/8]=60`, () => {
//       const score = `
//         BAR 1 [5/8] TEMPO [3/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 2, 'numBeats');
//     });

//     it(`BAR 1 [7/8] TEMPO [1/8]=180`, () => {
//       const score = `
//         BAR 1 [7/8] TEMPO [1/8]=180
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 3, 'numBeats');
//     });
//   });

//   describe('irregular (additive)', () => {
//     it(`BAR 1 [3+2/8] TEMPO [3/8]=60`, () => {
//       const score = `
//         BAR 1 [3+2/8] TEMPO [3/8]=60
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 2, 'numBeats');
//     });

//     it(`BAR 1 [2+3+2/8] TEMPO [1/8]=180`, () => {
//       const score = `
//         BAR 1 [2+3+2/8] TEMPO [1/8]=180
//       `;

//       const interpreter = new SoapScoreInterpreter(score);
//       const numBeats = interpreter.score[0].numBeats;

//       assert.equal(numBeats, 3, 'numBeats');
//     });
//   });
// });

describe('## _normalizeBeat(event, beat)', () => {
  describe('simple', () => {
    it('BAR 1 [4/4] TEMPO [1/4]=60', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);
      const event = interpreter.score[0];
      {
        const normBeat = interpreter._normalizeBeat(event, 1);
        assert.equal(normBeat, 0, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 1.5);
        assert.equal(normBeat, 0.125, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2);
        assert.equal(normBeat, 0.25, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 3);
        assert.equal(normBeat, 0.5, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 4);
        assert.equal(normBeat, 0.75, 'normBeat');
      }
    });
  });

  describe('compound', () => {
    it('BAR 1 [6/8] TEMPO [3/8]=60', () => {
      const score = `
        BAR 1 [6/8] TEMPO [3/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);
      const event = interpreter.score[0];
      {
        const normBeat = interpreter._normalizeBeat(event, 1);
        assert.equal(normBeat, 0, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2);
        assert.equal(normBeat, 0.5, 'normBeat');
      }
    })
  });

  describe('irregular', () => {
    it(`BAR 1 [5/8] TEMPO [3/8]=60`, () => {
      const score = `
        BAR 1 [5/8] TEMPO [3/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);
      const event = interpreter.score[0];
      {
        const normBeat = interpreter._normalizeBeat(event, 1);
        assert.equal(normBeat, 0, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 1.5);
        assert.equal(normBeat, 0.3, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2);
        assert.equal(normBeat, 0.6, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2.5);
        assert.equal(normBeat, 0.8, 'normBeat');
      }
    });

    it(`BAR 1 [7/8] TEMPO [1/8]=180`, () => {
      const score = `
        BAR 1 [7/8] TEMPO [1/8]=180
      `;
      // parsed as 3 + 3 + 2
      const interpreter = new SoapScoreInterpreter(score);
      const event = interpreter.score[0];

      {
        const normBeat = interpreter._normalizeBeat(event, 1);
        assert.equal(normBeat, 0, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 1.5);
        assert.equal(normBeat, 1.5 / 7, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2);
        assert.equal(normBeat, 3 / 7, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 3);
        assert.equal(normBeat, 5 / 7, 'normBeat');
      }
    });
  });

  describe('irregular (additive)', () => {
    it(`BAR 1 [2+3/8] TEMPO [3/8]=60`, () => {
      const score = `
        BAR 1 [2+3/8] TEMPO [3/8]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);
      const event = interpreter.score[0];

      {
        const normBeat = interpreter._normalizeBeat(event, 1);
        assert.equal(normBeat, 0, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 1.5);
        assert.equal(normBeat, 0.2, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2);
        assert.equal(normBeat, 0.4, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2.5);
        assert.equal(normBeat, 0.7, 'normBeat');
      }
    });

    it(`BAR 1 [2+3+2/8] TEMPO [1/8]=180`, () => {
      const score = `
        BAR 1 [2+3+2/8] TEMPO [1/8]=180
      `;

      const interpreter = new SoapScoreInterpreter(score);
      const event = interpreter.score[0];

      {
        const normBeat = interpreter._normalizeBeat(event, 1);
        assert.equal(normBeat, 0, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 2);
        assert.equal(normBeat, 2 / 7, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 3);
        assert.equal(normBeat, 5 / 7, 'normBeat');
      }
      {
        const normBeat = interpreter._normalizeBeat(event, 3.5);
        assert.equal(normBeat, 6 / 7, 'normBeat');
      }
    });
  });
});

describe('## _getEventAtLocation(bar, beat)', () => {
  it(`should retrieve closest event`, () => {
    const score = `
      BAR 1 [13/8] TEMPO [1/8]=60
      BAR 2 [1/3] TEMPO [1/8]=30
    `;

    const interpreter = new SoapScoreInterpreter(score);

    const event = interpreter._getEventAtLocation(2, 1);
    assert.equal(event.bar, 2);
    assert.equal(event.beat, 1);
  });
});

describe('## _getBarDuration(bar, beat)', () => {
  it('BAR 1 [4/4] TEMPO [1/4]=60', () => {
    const score = 'BAR 1 [4/4] TEMPO [1/4]=60';
    const interpreter = new SoapScoreInterpreter(score);
    const duration = interpreter._getBarDuration(interpreter.score[0]);
    assert.equal(duration, 4, 'duration');
  });

  it('BAR 1 [6/8] TEMPO [1/8]=60', () => {
    const score = 'BAR 1 [6/8] TEMPO [1/8]=60';
    const interpreter = new SoapScoreInterpreter(score);
    const duration = interpreter._getBarDuration(interpreter.score[0]);
    assert.equal(duration, 6, 'duration');
  });

  it('BAR 1 [5/8] TEMPO [1/4]=60', () => {
    const score = 'BAR 1 [5/8] TEMPO [1/4]=60';
    const interpreter = new SoapScoreInterpreter(score);
    const duration = interpreter._getBarDuration(interpreter.score[0]);
    assert.equal(duration, 2.5, 'duration');
  });

  it('BAR 1 [3+2+2/8] TEMPO [1/4]=120', () => {
    const score = 'BAR 1 [3+2+2/8] TEMPO [1/4]=120';
    const interpreter = new SoapScoreInterpreter(score);
    const duration = interpreter._getBarDuration(interpreter.score[0]);
    assert.equal(duration, 3.5 / 2, 'duration');
  });
});

describe('## _getNumBarWithinEvent(event, startBar, startBeat, endBar, endBeat)', () => {
  it('BAR 1 [4/4] TEMPO [1/4]=60', () => {
    const score = 'BAR 1 [4/4] TEMPO [1/4]=60';
    const interpreter = new SoapScoreInterpreter(score);
    const numBarNormalized = interpreter._getNumBarWithinEvent(interpreter.score[0], 1, 2, 2, 3);
    assert.equal(numBarNormalized, 1.25, 'numBarNormalized');
  });

  it('BAR 1 [6/8] TEMPO [1/8]=60', () => {
    const score = 'BAR 1 [6/8] TEMPO [1/8]=60';
    const interpreter = new SoapScoreInterpreter(score);
    const numBarNormalized = interpreter._getNumBarWithinEvent(interpreter.score[0], 2, 2, 3, 1);
    assert.equal(numBarNormalized, 0.5, 'numBarNormalized');
  });

  it('BAR 1 [5/8] TEMPO [1/4]=60', () => {
    const score = 'BAR 1 [5/8] TEMPO [1/4]=60';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const numBarNormalized = interpreter._getNumBarWithinEvent(interpreter.score[0], 2, 1, 3, 2);
      assert.equal(numBarNormalized, 1.6, 'numBarNormalized');
    }

    {
      const numBarNormalized = interpreter._getNumBarWithinEvent(interpreter.score[0], 1, 1, 1, 2.5);
      assert.equal(numBarNormalized, 0.8, 'numBarNormalized');
    }
  });

  it('BAR 1 [5/8] TEMPO [1/4]=60', () => {
    const score = 'BAR 1 [5/8] TEMPO [1/4]=60';
    const interpreter = new SoapScoreInterpreter(score);
    const numBarNormalized = interpreter._getNumBarWithinEvent(interpreter.score[0], 2, 1, 3, 2);
    assert.equal(numBarNormalized, 1.6, 'numBarNormalized');
  });

  it('BAR 1 [3+2+2/8] TEMPO [1/4]=120', () => {
    const score = 'BAR 1 [3+2+2/8] TEMPO [1/4]=120';
    const interpreter = new SoapScoreInterpreter(score);
    const numBarNormalized = interpreter._getNumBarWithinEvent(interpreter.score[0], 1, 2, 3, 3);
    assert.equal(numBarNormalized, 2 + 2 / 7, 'numBarNormalized');
  });
});

// note: this method is used to compute bpm in curve and adds a "beat" to the result,
// cf. note in the implementation
describe(`## _getNumBarAccrosEvents(startBar, startBeat, endBar, endBeat)`, () => {
  it(`simple + compound`, () => {
    const score = `\
      BAR 1 [4/4] TEMPO [1/4]=60 curve 1
      BAR 2 [3/4]
        |2 "coucou"
      BAR 3 [6/8] TEMPO [3/8]=[1/4]
      BAR 4 [4/4] TEMPO [1/4]=120
    `;

    const interpreter = new SoapScoreInterpreter(score);
    const numUnits = interpreter._getNumBarAccrosEvents(1, 2, 4, 1);
    assert.equal(numUnits, 2 + 0.25);
  });

  it(`simple + irregular (additive)`, () => {
    const score = `\
      BAR 1 [4/4] TEMPO [1/4]=60 curve 1
      BAR 2 [3/4]
        |2 "coucou"
      BAR 3 [2+3/8] TEMPO [1/8]=[1/4]
      BAR 4 [4/4] TEMPO [1/4]=120
    `;

    const interpreter = new SoapScoreInterpreter(score);
    const numUnits = interpreter._getNumBarAccrosEvents(1, 2, 4, 1);
    assert.equal(numUnits, 2.75 + 0.25);
  });

  it(`simple + irregular (additive)`, () => {
    // stop in the middle of the additive bar
    const score = `\
      BAR 1 [4/4] TEMPO [1/4]=60 curve 1
      BAR 2 [3/4]
        |2 "coucou"
      BAR 3 [2+3/8] TEMPO [1/8]=[1/4]
      BAR 4 [4/4] TEMPO [1/4]=120
    `;

    const interpreter = new SoapScoreInterpreter(score);
    const numUnits = interpreter._getNumBarAccrosEvents(1, 2, 3, 2);
    assert.equal(numUnits, 2 + 0.25);
  });
});

describe(`## _getBpmInCurve(curve, bar, beat)`, () => {
  it(`simple`, () => {
    const score = `\
      BAR 1 [4/4] TEMPO [1/4]=60 curve 1
      BAR 2 [4/4] TEMPO [1/4]=120
    `;

    const interpreter = new SoapScoreInterpreter(score);
    const { curve } = interpreter.score[0].tempo;

    // first beat is already faster
    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 1);
      assert.equal(bpm, 72);
    }

    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 2);
      assert.equal(bpm, 84);
    }

    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 3);
      assert.equal(bpm, 96);
    }

    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 4);
      assert.equal(bpm, 108);
    }

    {
      const bpm = interpreter._getBpmInCurve(curve, 2, 1);
      assert.equal(bpm, 120);
    }
  });

  // should be reltive to tempo basis
  it(`simple 2 - check that result is not relative to tempo basis`, () => {
    const score = `\
      BAR 1 [4/4] TEMPO [1/8]=60 curve 1
      BAR 2 [4/4] TEMPO [1/8]=120
    `;

    const interpreter = new SoapScoreInterpreter(score);
    const { curve } = interpreter.score[0].tempo;

    // first beat is already faster
    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 1);
      assert.equal(bpm, 72);
    }
    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 2);
      assert.equal(bpm, 84);
    }

    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 3);
      assert.equal(bpm, 96);
    }

    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 4);
      assert.equal(bpm, 108);
    }

    {
      const bpm = interpreter._getBpmInCurve(curve, 2, 1);
      assert.equal(bpm, 120);
    }
  });

  it(`compound`, () => {
    const score = `\
      BAR 1 [6/8] TEMPO [3/8]=60 curve 1
      BAR 2 [6/8] TEMPO [3/8]=120
    `;

    const interpreter = new SoapScoreInterpreter(score);
    const { curve } = interpreter.score[0].tempo;

    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 1);
      assert.equal(bpm, 80);
    }
    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 2);
      assert.equal(bpm, 100);
    }
    {
      const bpm = interpreter._getBpmInCurve(curve, 2, 1);
      assert.equal(bpm, 120);
    }
  });

  it(`irregular (additive)`, () => {
    const score = `\
      BAR 1 [3+2+2/8] TEMPO [3/8]=60 curve 1
      BAR 2 [3+2+2/8] TEMPO [3/8]=120
    `;

    const interpreter = new SoapScoreInterpreter(score);
    const { curve } = interpreter.score[0].tempo;

    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 1);
      assert.equal(bpm, 78);    // + 18 (3*6) -> 96
    }
    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 2);
      assert.equal(bpm, 96);    // + 12 (2*6) -> 108
    }
    {
      const bpm = interpreter._getBpmInCurve(curve, 1, 3);
      assert.equal(bpm, 108);   // + 12 (2*6) -> 120
    }
    {
      const bpm = interpreter._getBpmInCurve(curve, 2, 1);
      assert.equal(bpm, 120);
    }
  });
});

describe('## _getBeatDuration(event, bar, beat) [w/ curve applied]', () => {
  it('BAR 1 [4/4] TEMPO [1/4]=120', () => {
    const score = 'BAR 1 [4/4] TEMPO [1/4]=120';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1);
      assert.equal(beatDuration, 0.5, 'beatDuration');
    }
    // must work with floating point values
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1.5);
      assert.equal(beatDuration, 0.25, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 2);
      assert.equal(beatDuration, 0.5, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 3);
      assert.equal(beatDuration, 0.5, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 4);
      assert.equal(beatDuration, 0.5, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 4.5);
      assert.equal(beatDuration, 0.25, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 2, 1);
      assert.equal(beatDuration, 0.5, 'beatDuration');
    }
  });

  it('BAR 1 [6/8] TEMPO [1/8]=60', () => {
    const score = 'BAR 1 [6/8] TEMPO [1/8]=60';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1);
      assert.equal(beatDuration, 3, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1.5);
      assert.equal(beatDuration, 1.5, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 2);
      assert.equal(beatDuration, 3, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 2, 1);
      assert.equal(beatDuration, 3, 'beatDuration');
    }
  });

  it('BAR 1 [5/8] TEMPO [1/4]=60', () => {
    const score = 'BAR 1 [5/8] TEMPO [1/4]=60';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1);
      assert.equal(beatDuration, 1.5, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1.5);
      assert.equal(beatDuration, 0.75, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 2);
      assert.equal(beatDuration, 1, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 2.5);
      assert.equal(beatDuration, 0.5, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 2, 1);
      assert.equal(beatDuration, 1.5, 'beatDuration');
    }
  });

  it('BAR 1 [3+2+2/8] TEMPO [1/4]=120', () => {
    const score = 'BAR 1 [2+3+2/8] TEMPO [3/8]=60';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1);
      assert.equal(beatDuration, 2 / 3, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1.5);
      assert.equal(beatDuration, 2 / 3 / 2, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 2);
      assert.equal(beatDuration, 1, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 2.5);
      assert.equal(beatDuration, 0.5, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 3);
      assert.equal(beatDuration, 2 / 3, 'beatDuration');
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 2, 1);
      assert.equal(beatDuration, 2 / 3, 'beatDuration');
    }
  });

  it(`BAR 1 4s`, () => {
    const score = `BAR 1 4s`;
    const interpreter = new SoapScoreInterpreter(score);

    // first beat is already faster
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1);
      assert.equal(beatDuration, 4);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1.5);
      assert.equal(beatDuration, 2);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 2, 1);
      assert.equal(beatDuration, 4);
    }
  });

  it(`BAR 1 [4/4] TEMPO [1/4]=60 curve 1
      BAR 2 [4/4] TEMPO [1/4]=120
  `, () => {
    const score = `
      BAR 1 [4/4] TEMPO [1/4]=60 curve 1
      BAR 2 [4/4] TEMPO [1/4]=120
    `;
    const interpreter = new SoapScoreInterpreter(score);

    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1);
      assert.equal(beatDuration, 60 / 72);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 1.5);
      assert.equal(beatDuration, 60 / 72 / 2);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 2);
      assert.equal(beatDuration, 60 / 84);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 3);
      assert.equal(beatDuration, 60 / 96);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 3.5);
      assert.equal(beatDuration, 60 / 96 / 2);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 1, 4);
      assert.equal(beatDuration, 60 / 108);
    }
    {
      const beatDuration = interpreter._getBeatDuration(interpreter.score[0], 2, 1);
      assert.equal(beatDuration, 60 / 120);
    }
  });
});

describe('## _getNextLocation(event, bar, beat)', () => {
  it('BAR 1 [4/4] TEMPO [1/4]=120', () => {
    const score = 'BAR 1 [4/4] TEMPO [1/4]=120';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 1);
      assert.deepEqual(nextLocation, { bar: 1, beat: 2 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 2);
      assert.deepEqual(nextLocation, { bar: 1, beat: 3 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 3);
      assert.deepEqual(nextLocation, { bar: 1, beat: 4 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 4);
      assert.deepEqual(nextLocation, { bar: 2, beat: 1 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 2, 1);
      assert.deepEqual(nextLocation, { bar: 2, beat: 2 }, 'nextLocation');
    }
  });

  it('BAR 1 [6/8] TEMPO [1/8]=60', () => {
    const score = 'BAR 1 [6/8] TEMPO [1/8]=60';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 1);
      assert.deepEqual(nextLocation, { bar: 1, beat: 2 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 2);
      assert.deepEqual(nextLocation, { bar: 2, beat: 1 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 2, 1);
      assert.deepEqual(nextLocation, { bar: 2, beat: 2 }, 'nextLocation');
    }
  });

  it('BAR 1 [5/8] TEMPO [1/4]=60', () => {
    const score = 'BAR 1 [5/8] TEMPO [1/4]=60';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 1);
      assert.deepEqual(nextLocation, { bar: 1, beat: 2 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 2);
      assert.deepEqual(nextLocation, { bar: 2, beat: 1 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 2, 1);
      assert.deepEqual(nextLocation, { bar: 2, beat: 2 }, 'nextLocation');
    }
  });

  it('BAR 1 [3+2+2/8] TEMPO [1/4]=120', () => {
    const score = 'BAR 1 [2+3+2/8] TEMPO [3/8]=60';
    const interpreter = new SoapScoreInterpreter(score);

    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 1);
      assert.deepEqual(nextLocation, { bar: 1, beat: 2 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 2);
      assert.deepEqual(nextLocation, { bar: 1, beat: 3 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 3);
      assert.deepEqual(nextLocation, { bar: 2, beat: 1 }, 'nextLocation');
    }
    {
      const nextLocation = interpreter._getNextLocation(interpreter.score[0], 2, 1);
      assert.deepEqual(nextLocation, { bar: 2, beat: 2 }, 'nextLocation');
    }
  });

  it(`BAR 1 [4/4] TEMPO [1/4]=60
      BAR 2 END
  `, () => {
    const score = `
      BAR 1 [4/4] TEMPO [1/4]=60
      BAR 2 END
    `;
    const interpreter = new SoapScoreInterpreter(score);
    // pick second event which defines the end of score
    const nextLocation = interpreter._getNextLocation(interpreter.score[1], 2, 4);
    assert.deepEqual(nextLocation, null, 'nextLocation');
  });

  it(`BAR 1 2s`, () => {
    const score = `
      BAR 1 2s
    `;
    const interpreter = new SoapScoreInterpreter(score);
    const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 1);
    assert.deepEqual(nextLocation, { bar: 2, beat: 1 }, 'nextLocation');
  });

  it(`BAR 1 2s END`, () => {
    const score = `
      BAR 1 2s END
    `;
    const interpreter = new SoapScoreInterpreter(score);
    const nextLocation = interpreter._getNextLocation(interpreter.score[0], 1, 1);
    assert.deepEqual(nextLocation, null, 'nextLocation');
  });
});

describe('## _hasEventBetweenLocations(preBar, preBeat, postBar, postBeat)', () => {
  it(`BAR 1 [4/4] TEMPO [1/4]=60 |1.5 "label"`, () => {
    const score = `
      BAR 1 [4/4] TEMPO [1/4]=60 |1.5 "label"
    `;
    const interpreter = new SoapScoreInterpreter(score);

    {
      let event = interpreter._hasEventBetweenLocations(1, 1, 1, 2);
      assert.equal(event.bar, 1);
      assert.equal(event.beat, 1.5);
      assert.equal(event.label, 'label');
    }
    {
      let event = interpreter._hasEventBetweenLocations(1, 1.5, 1, 2);
      assert.equal(event, null);
    }
    {
      let event = interpreter._hasEventBetweenLocations(1, 1, 1, 1.5);
      assert.equal(event, null);
    }
  });

  it(`BAR 1 [4/4] TEMPO [1/4]=60 |4.5 "accent"`, () => {
    const score = `
      BAR 1 [4/4] TEMPO [1/4]=60 |4.5 "accent"
    `;
    const interpreter = new SoapScoreInterpreter(score);

    {
      let event = interpreter._hasEventBetweenLocations(1, 4, 2, 1);
      assert.equal(event.bar, 1);
      assert.equal(event.beat, 4.5);
      assert.equal(event.label, 'accent');
    }
  });
});

