import { assert } from 'chai';

import SoapScoreInterpreter from '../src/SoapScoreInterpreter.js';

describe('# SoapScoreInterpreter', () => {
  describe('## SoapScoreInterpreter#getPositionAtLocation(bar, beat)', () => {
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
  });

  describe('SoapScoreInterpreter#getLocationAtPosition', () => {
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

  describe.only(`## getNextLocationInfos(bar, beat)`, () => {
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
        console.log(bar, beat)
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

    it.only('asbolute duration measures', () => {
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
  });
});

