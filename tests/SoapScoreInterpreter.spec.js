import { assert } from 'chai';

import SoapScoreInterpreter from '../src/SoapScoreInterpreter.js';

describe('# SoapScoreInterpreter', () => {
  describe(`## getNextLocation(bar, beat)`, () => {
    it(`should work with additive measures`, () => {
      const score = `
        BAR 1 [3+2+2/8] TEMPO [3/8]=60
        BAR 2 [2+3+2/8]
      `;

      const interpreter = new SoapScoreInterpreter(score);

      const { nextBar, nextBeat } = interpreter.getNextLocation(1, 3);
      assert.equal(nextBar, 2);
      assert.equal(nextBeat, 1);
    });
  });

  describe('## getPositionAtLocation(bar, beat)', () => {
    it('should work with simplest score', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(2);
        assert.equal(position, 4);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 4);
        assert.equal(position, 7);
      }
    });

    it('should work with something a bit more weird 1', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(2);
        assert.equal(position, 4);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 4);
        assert.equal(position, 7);
      }
    });

    it('should work with something a bit more weird 2', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
        BAR 3 [2/4] TEMPO [1/8]=72
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(2);
        assert.equal(position, 4);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 4);
        assert.equal(position, 7);
      }
    });

    it('should work with something a bit more weird 3', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=60
        BAR 2 [3/4] TEMPO [1/4]=60
        BAR 3 [2/4] TEMPO [1/8]=72
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(2);
        assert.equal(position, 8);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 3);
        assert.equal(position, 10);
      }
      {
        const position = interpreter.getPositionAtLocation(3, 1.5);
        assert.equal(position, 11 + (60 / 72));
      }
    });

    it('should work with something a bit more weird 4', () => {
      const score = `
        BAR 1 [13/8] TEMPO [1/8]=60
        BAR 10 [7/8] TEMPO [1/8]=30
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getPositionAtLocation(1);
        assert.equal(position, 0);
      }
      {
        const position = interpreter.getPositionAtLocation(2);
        assert.equal(position, 13);
      }
      {
        const position = interpreter.getPositionAtLocation(2, 3);
        assert.isBelow(Math.abs(position - 15), 1e-8);
      }
      {
        const position = interpreter.getPositionAtLocation(10, 1);
        assert.equal(position, 117);
      }
      {
        const position = interpreter.getPositionAtLocation(11);
        assert.equal(position, 131);
      }
    });

    it('should work with curves', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60 curve 1;
        BAR 2 TEMPO [1/4]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      // tempi will be
      // 72, 84, 96, 108 | 120, 120, 120, ...

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

      // target beat is a float
      {
        // first
        const position = interpreter.getPositionAtLocation(1, 2.5);
        assert.equal(position, 60 / 72 + (60 / 84) * 0.5);
      }
    });
  });

  describe('## getLocationAtPosition(position)', () => {
    it('should work with simplest score', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getLocationAtPosition(0);
        assert.deepEqual(position, { bar: 1, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(4);
        assert.deepEqual(position, { bar: 2, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(7);
        assert.deepEqual(position, { bar: 2, beat: 4 });
      }
    });

    it('should work with something a bit more weird', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getLocationAtPosition(0);
        assert.deepEqual(position, { bar: 1, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(4);
        assert.deepEqual(position, { bar: 2, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(7);
        assert.deepEqual(position, { bar: 2, beat: 4 });
      }
    });

    it('should work with something a bit more weird 2', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=120
        BAR 3 [2/4] TEMPO [1/8]=72
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getLocationAtPosition(0);
        assert.deepEqual(position, { bar: 1, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(4);
        assert.deepEqual(position, { bar: 2, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(7);
        assert.deepEqual(position, { bar: 2, beat: 4 });
      }
    });

    it('should work with something a bit more weird 3', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/8]=60
        BAR 2 [3/4] TEMPO [1/4]=60
        BAR 3 [2/4] TEMPO [1/8]=72
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getLocationAtPosition(0);
        assert.deepEqual(position, { bar: 1, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(8);
        assert.deepEqual(position, { bar: 2, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(10);
        assert.deepEqual(position, { bar: 2, beat: 3 });
      }
      {
        const position = interpreter.getLocationAtPosition(11 + (60 / 72));
        assert.equal(position.bar, 3);
        assert.isBelow(Math.abs(position.beat - 1.5), 1e-9);
      }
    });

    it('should work with something a bit more weird 4', () => {
      const score = `
        BAR 1 [13/8] TEMPO [1/8]=60
        BAR 10 [7/8] TEMPO [1/8]=30
      `;

      const interpreter = new SoapScoreInterpreter(score);

      {
        const position = interpreter.getLocationAtPosition(0); // 1
        assert.deepEqual(position, { bar: 1, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(13); // 2
        assert.deepEqual(position, { bar: 2, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(15); // 2, 3
        // assert.deepEqual(position, { bar: 2, beat: 3 });
        assert.equal(position.bar, 2);
        assert.isBelow(Math.abs(position.beat - 3), 1e-9);
      }
      {
        const position = interpreter.getLocationAtPosition(117); // 10, 1
        assert.deepEqual(position, { bar: 10, beat: 1 });
      }
      {
        const position = interpreter.getLocationAtPosition(131); // 11
        assert.deepEqual(position, { bar: 11, beat: 1 });
      }
    });

    it('should work with curves', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60 curve 1;
        BAR 2 TEMPO [1/4]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);
      // tempi are
      // 72, 84, 96, 108 | 120, 120, 120, ...

      {
        const position = 0;
        const location = interpreter.getLocationAtPosition(position);
        assert.deepEqual(location, { bar: 1, beat: 1 });
      }

      {
        // first
        const position = 60 / 72;
        const location = interpreter.getLocationAtPosition(position);
        assert.deepEqual(location, { bar: 1, beat: 2 });
      }

      {
        const position = 60 / 72 + 60 / 84;
        const location = interpreter.getLocationAtPosition(position);
        assert.deepEqual(location, { bar: 1, beat: 3 });
      }

      {
        const position = 60 / 72 + 60 / 84 + 60 / 96;
        const location = interpreter.getLocationAtPosition(position);
        assert.equal(location.bar, 1);
        assert.isBelow(Math.abs(location.beat - 4), 1e-6);
      }

      {
        // there a floating point errors
        // logical is { bar: 2, beat: 1 }
        // computed is { bar: 1, beat: 4.999999999999999 }
        const position = 60 / 72 + 60 / 84 + 60 / 96 + 60 / 108;
        const location = interpreter.getLocationAtPosition(position);
        assert.equal(location.bar, 1);
        assert.isBelow(Math.abs(location.beat - 5), 1e-6);
      }

      {
        const position = 60 / 72 + 60 / 84 + 60 / 96 + 60 / 108 + 60 / 120;
        const location = interpreter.getLocationAtPosition(position);
        assert.deepEqual(location, { bar: 2, beat: 2 });
      }

      // target beat is a float
      {
        // first
        const position = 60 / 72 + (60 / 84) * 0.5;
        const location = interpreter.getLocationAtPosition(position);
        assert.deepEqual(location, { bar: 1, beat: 2.5 });
      }
    });
  });

  describe('## getEventAtLocation(bar, beat)', () => {
    it(`should retrieve closest event`, () => {
      const score = `
        BAR 1 [13/8] TEMPO [1/8]=60
        BAR 2 [1/3] TEMPO [1/8]=30
      `;

      const interpreter = new SoapScoreInterpreter(score);

      const event = interpreter.getEventAtLocation(2, 1);
      assert.equal(event.bar, 2);
      assert.equal(event.beat, 1);

    });
  });

  describe(`## getNextLocationInfos(bar, beat)`, () => {
    it(`should work with compound beats`, () => {
      const score = `BAR 1 [6/8] TEMPO [3/8]=60`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1);
        assert.equal(beat, 2);
      }

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 2);
        assert.equal(beat, 1);
      }
    });

    it(`should work with compound beats`, () => {
      const score = `BAR 1 [6/8] TEMPO [1/8]=60`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1);
        assert.equal(beat, 2);
      }

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 5);
        assert.equal(bar, 1);
        assert.equal(beat, 6);
      }

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 6);
        assert.equal(bar, 2);
        assert.equal(beat, 1);
      }
    });

    it(`should work with compound beats`, () => {
      const score = `BAR 1 [6/8] TEMPO [1/4]=60`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1);
        assert.equal(beat, 2);
      }

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 1);
        assert.equal(beat, 3);
      }

      {
        let { bar, beat } = interpreter.getNextLocationInfos(1, 3);
        assert.equal(bar, 2);
        assert.equal(beat, 1);
      }
    });

    it(`should work with compound beats`, () => {
      const score = `BAR 1 [5/8] TEMPO [1/4]=120`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        const { bar, beat, basis, duration } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1);
        assert.equal(beat, 1);
        assert.equal(duration, 0.5);
        assert.equal(basis.upper, 1);
        assert.equal(basis.lower, 4);
      }

      {
        const { bar, beat, basis, duration } = interpreter.getLocationInfos(1, 2);
        assert.equal(bar, 1);
        assert.equal(beat, 2);
        assert.equal(duration, 0.5);
        assert.equal(basis.upper, 1);
        assert.equal(basis.lower, 4);
      }

      {
        const { bar, beat, basis, duration } = interpreter.getLocationInfos(1, 3);
        assert.equal(bar, 1);
        assert.equal(beat, 3);
        assert.equal(duration, 0.25);
        assert.equal(basis.upper, 1);
        assert.equal(basis.lower, 8);
      }

      {
        const { bar, beat, basis, duration } = interpreter.getLocationInfos(2, 1);
        assert.equal(bar, 2);
        assert.equal(beat, 1);
        assert.equal(duration, 0.5);
        assert.equal(basis.upper, 1);
        assert.equal(basis.lower, 4);
      }
    });

    it('should work with complex measures', () => {
      const score = `BAR 1 [3+2+2/8] TEMPO [3/8]=60`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat, basis, duration } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1);
        assert.equal(beat, 1);
        assert.equal(basis.upper, 3);
        assert.equal(basis.lower, 8);
        assert.equal(duration, 1);
      }

      {
        let { bar, beat, basis, duration } = interpreter.getLocationInfos(1, 2);
        assert.equal(bar, 1);
        assert.equal(beat, 2);
        assert.equal(basis.upper, 2);
        assert.equal(basis.lower, 8);
        assert.equal(duration, 2/3);
      }

      {
        let { bar, beat, basis, duration } = interpreter.getLocationInfos(1, 3);
        assert.equal(bar, 1);
        assert.equal(beat, 3);
        assert.equal(basis.upper, 2);
        assert.equal(basis.lower, 8);
        assert.equal(duration, 2/3);
      }

      {
        let { bar, beat, basis, duration } = interpreter.getLocationInfos(2, 1);
        assert.equal(bar, 2);
        assert.equal(beat, 1);
        assert.equal(basis.upper, 3);
        assert.equal(basis.lower, 8);
        assert.equal(duration, 1);
      }
    });

    it('absolute duration measures', () => {
      const score = `BAR 1 2s`;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat, basis, duration } = interpreter.getLocationInfos(1, 2);
        assert.equal(bar, 1);
        assert.equal(beat, 1);
        assert.equal(basis.upper, 1);
        assert.equal(basis.lower, 1);
        assert.equal(duration, 2);
      }
    });

    it('events in between beats 1', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |1.5 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar 1');
        assert.equal(beat, 1, 'beat 1');
        assert.equal(position, 0, 'position 1');
        assert.equal(duration, 1, 'duration 1');
        assert.equal(dt, 0.5, 'dt 1');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar 2');
        assert.equal(beat, 1.5, 'beat 2');
        assert.equal(position, 0.5, 'position 2');
        assert.equal(duration, 0.5, 'duration 2');
        assert.equal(dt, 0.5, 'dt 2');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getNextLocationInfos(1, 1.5);
        assert.equal(bar, 1, 'bar 3');
        assert.equal(beat, 2, 'beat 3');
        assert.equal(position, 1, 'position 3');
        assert.equal(duration, 1, 'duration 3');
        assert.equal(dt, 1, 'dt 3');
      }
    });

    it('events in between beats 2', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |1.6 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat, dt, event, position, basis, duration } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar 1');
        assert.equal(beat, 1, 'beat 1');
        assert.equal(duration, 1, 'duration 1');
        assert.equal(position, 0, 'position 1');
        assert.isBelow(Math.abs(dt - 0.6), 1e-9, 'dt 1'); // 0.6000000000000001
      }

      {
        let { bar, beat, dt, event, position, basis, duration } = interpreter.getNextLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar 2');
        assert.equal(beat, 1.6, 'beat 2');
        assert.isBelow(Math.abs(duration - 0.4), 1e-9, 'duration 2');
        assert.isBelow(Math.abs(position - 0.6), 1e-9, 'position 2'); // 0.6000000000000001
        assert.isBelow(Math.abs(dt - 0.4), 1e-9, 'dt 2');
      }

      {
        let { bar, beat, dt, event, position, basis, duration } = interpreter.getNextLocationInfos(1, 1.6);
        assert.equal(bar, 1, 'bar 3');
        assert.equal(beat, 2, 'beat 3');
        assert.equal(duration, 1, 'duration 3');
        assert.equal(position, 1, 'position 3');
        assert.equal(dt, 1, 'dt 3');
      }
    });

    it('events in between beats 3', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=120
        |4.5 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar 1');
        assert.equal(beat, 1, 'beat 1');
        assert.equal(position, 0, 'position 1');
        assert.equal(duration, 0.5, 'duration 1');
        assert.equal(dt, 0.5, 'dt 1');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getLocationInfos(1, 4);
        assert.equal(bar, 1, 'bar 2');
        assert.equal(beat, 4, 'beat 2');
        assert.equal(position, 1.5, 'position 2');
        assert.equal(duration, 0.5, 'duration 2');
        assert.equal(dt, 0.25, 'dt 2');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getNextLocationInfos(1, 4);
        assert.equal(bar, 1, 'bar 3');
        assert.equal(beat, 4.5, 'beat 3');
        assert.equal(position, 1.75, 'position 3');
        assert.equal(duration, 0.25, 'duration 3');
        assert.equal(dt, 0.25, 'dt 3');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getLocationInfos(1, 4.5);
        assert.equal(bar, 1, 'bar 4');
        assert.equal(beat, 4.5, 'beat 4');
        assert.equal(position, 1.75, 'position 4');
        assert.equal(duration, 0.25, 'duration 4');
        assert.equal(dt, 0.25, 'dt 4');
      }
    });

    it('fermata abs duration', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=10s
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar 1');
        assert.equal(beat, 1, 'beat 1');
        assert.equal(position, 0, 'position 1');
        assert.equal(duration, 1, 'duration 1');
        assert.equal(dt, 1, 'dt 1');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar 2');
        assert.equal(beat, 3, 'beat 2');
        assert.equal(position, 2, 'position 2');
        assert.equal(duration, 1, 'duration 2');
        assert.equal(dt, 10, 'dt 2');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getNextLocationInfos(1, 3);
        assert.equal(bar, 2, 'bar 3');
        assert.equal(beat, 1, 'beat 3');
        assert.equal(position, 4, 'position 3');
        assert.equal(duration, 1, 'duration 3');
        assert.equal(dt, 1, 'dt 3');
      }
    });

    it('fermata rel duration', () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |3 FERMATA [2/4]=2*
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getLocationInfos(1, 1);
        assert.equal(bar, 1, 'bar 1');
        assert.equal(beat, 1, 'beat 1');
        assert.equal(position, 0, 'position 1');
        assert.equal(duration, 1, 'duration 1');
        assert.equal(dt, 1, 'dt 1');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getNextLocationInfos(1, 2);
        assert.equal(bar, 1, 'bar 2');
        assert.equal(beat, 3, 'beat 2');
        assert.equal(position, 2, 'position 2');
        assert.equal(duration, 1, 'duration 2');
        assert.equal(dt, 4, 'dt 2');
      }

      {
        let { bar, beat, duration, dt, event, position, basis } = interpreter.getNextLocationInfos(1, 3);
        assert.equal(bar, 2, 'bar 3');
        assert.equal(beat, 1, 'beat 3');
        assert.equal(position, 4, 'position 3');
        assert.equal(duration, 1, 'duration 3');
        assert.equal(dt, 1, 'dt 3');
      }
    });
  });

  describe('## hasEventBetweenLocations(preBar, preBeat, postBar, postBeat)', () => {
    it(`should work 1`, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |1.5 "label"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let event = interpreter.hasEventBetweenLocations(1, 1, 1, 2);
        assert.equal(event.bar, 1);
        assert.equal(event.beat, 1.5);
        assert.equal(event.label, 'label');
      }

      {
        let event = interpreter.hasEventBetweenLocations(1, 1.5, 1, 2);
        assert.equal(event, null);
      }

      {
        let event = interpreter.hasEventBetweenLocations(1, 1, 1, 1.5);
        assert.equal(event, null);
      }
    });

    it(`should work 2`, () => {
      const score = `
        BAR 1 [4/4] TEMPO [1/4]=60
        |4.5 "accent"
      `;
      const interpreter = new SoapScoreInterpreter(score);

      {
        let event = interpreter.hasEventBetweenLocations(1, 4, 2, 1);
        assert.equal(event.bar, 1);
        assert.equal(event.beat, 4.5);
        assert.equal(event.label, 'accent');
      }
    });
  });

  describe(`## getNumUnitsInInterval(startBar, startBeat, endBar, endBeat)`, () => {
    it(`should work `, () => {
      //
      {
        const score = `\
          BAR 1 [4/4] TEMPO [1/4]=60 curve 1
          BAR 2 [3/4]
            |2 "coucou"
          BAR 3 [6/8] TEMPO [3/8]=[1/4]
          BAR 4 [4/4] TEMPO [1/4]=120
        `;

        const interpreter = new SoapScoreInterpreter(score);
        const numUnits = interpreter.getNumUnitsInInterval(1, 1, 4, 1);
        assert.equal(numUnits, 9);
      }

      {
        const score = `\
          BAR 1 [4/4] TEMPO [1/4]=60 curve 1
          BAR 2 [3/4]
            |2 "coucou"
          BAR 3 [6/8] TEMPO [1/8]=[1/4]
          BAR 4 [4/4] TEMPO [1/4]=120
        `;

        const interpreter = new SoapScoreInterpreter(score);
        const numUnits = interpreter.getNumUnitsInInterval(1, 1, 4, 1);
        assert.equal(numUnits, 13);
      }
    });
  });

  describe(`## computeBpmInCurve(curve, bar, beat)`, () => {
    it(`should work`, () => {
      const score = `\
        BAR 1 [4/4] TEMPO [1/4]=60 curve 1
        BAR 2 [4/4] TEMPO [1/4]=120
      `;

      const interpreter = new SoapScoreInterpreter(score);
      const infos = interpreter.getLocationInfos(1, 1);
      const { curve } = infos.event.tempo;

      // first beat is already faster
      {
        const bpm = interpreter.computeBpmInCurve(curve, 1, 1);
        assert.equal(bpm, 72);
      }

      {
        const bpm = interpreter.computeBpmInCurve(curve, 1, 2);
        assert.equal(bpm, 84);
      }

      {
        const bpm = interpreter.computeBpmInCurve(curve, 1, 3);
        assert.equal(bpm, 96);
      }

      {
        const bpm = interpreter.computeBpmInCurve(curve, 1, 4);
        assert.equal(bpm, 108);
      }

      {
        const bpm = interpreter.computeBpmInCurve(curve, 2, 1);
        assert.equal(bpm, 120);
      }
    });
  });
});

