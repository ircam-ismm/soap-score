import { assert } from 'chai';

import midi2soap from '../src/parsers/midi2soap.js';
import { writeScore } from '../src/soap-score-writer.js';
import { parseScore } from '../src/soap-score-parser.js';

describe('soap.parse.midi2soap', () => {
  describe('# Simple Examples', () => {
    it('## Example 1', () => {
      const input = [
        { deltaTime: 0, type: 255, metaType: 88, data: [ 4, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 1000000 },
        { deltaTime: 0, type: 255, metaType: 47 } ];
      const outputScore = midi2soap.parse(input);
      console.log(outputScore);
      const outputData = parseScore(outputScore);
      const expectedScore = `BAR 1 [4/4] TEMPO [1/4]=60`;
      const expectedData = parseScore(expectedScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## Example 2', () => {
      const input = [
        { deltaTime: 0, type: 255, metaType: 88, data: [ 6, 3, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 666667 },
        { deltaTime: 0, type: 255, metaType: 47 }
      ];
      // please keep midi format will convert every tempo basis to quarter note
      const expectedScore = `BAR 1 [6/8] TEMPO [1/4]=90`;
      const outputScore = midi2soap.parse(input);
      console.log(outputScore);
      const outputData = parseScore(outputScore);
      const expectedData = parseScore(expectedScore);
      assert.deepEqual(outputData, expectedData);

    })
    it('## Example 3', () => {
      const input = [
        { deltaTime: 0, type: 255, metaType: 88, data: [ 4, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 500000 },
        { deltaTime: 7680, type: 255, metaType: 88, data: [ 6, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 500000 },
        { deltaTime: 5760, type: 255, metaType: 88, data: [ 4, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 500000 },
        { deltaTime: 0, type: 255, metaType: 47 } ];
      const outputScore = midi2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 [6/4]
BAR 4 [4/4] \
`;
      const expectedData = parseScore(expectedScore);
      console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## Example 4', () => {
      const input = [
        { deltaTime: 0, type: 255, metaType: 88, data: [ 4, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 500000 },
        { deltaTime: 7680, type: 255, metaType: 81, data: 1200000 },
        { deltaTime: 0, type: 255, metaType: 47 } ];
      const outputScore = midi2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 TEMPO [1/4]=50 \
`;
      const expectedData = parseScore(expectedScore);
      console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
  });
  describe('# Labels', () => {
    it('## Example 1', () => {
      const input = [
        { deltaTime: 0, type: 255, metaType: 88, data: [ 4, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 500000 },
        { deltaTime: 0, type: 255, metaType: 6, data: 'section A' },
        { deltaTime: 7680, type: 255, metaType: 6, data: 'section B' },
        { deltaTime: 0, type: 255, metaType: 47 } ];
      const outputScore = midi2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=120 "section A"
BAR 3 "section B" \
`;
      const expectedData = parseScore(expectedScore);
      console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## Example 2', () => {
      const input = [
        { deltaTime: 0, type: 255, metaType: 88, data: [ 4, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 500000 },
        { deltaTime: 0, type: 255, metaType: 6, data: 'To Flute' },
        { deltaTime: 1920, type: 255, metaType: 6, data: 'To Piccolo' },
        { deltaTime: 0, type: 255, metaType: 47 } ];
      const outputScore = midi2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=120 "To Flute"
|3 "To Piccolo" \
`;
      const expectedData = parseScore(expectedScore);
      console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## Example 3', () => {
      const input = [
        { deltaTime: 0, type: 255, metaType: 88, data: [ 4, 2, 24, 8 ] },
        { deltaTime: 0, type: 255, metaType: 81, data: 500000 },
        { deltaTime: 3360, type: 255, metaType: 6, data: 'accent' },
        { deltaTime: 0, type: 255, metaType: 47 } ];
      const outputScore = midi2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=120
|4.5 "accent" \
`;
      const expectedData = parseScore(expectedScore);
      console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    })
  });
  describe('# From Reaper Example', () => {
    it('## Example 1', () => {
      const input = [
  {
    deltaTime: 0,
    type: 255,
    metaType: 88,
    data: [ 4, 2, 24, 8 ]
  },
  {
    deltaTime: 0,
    type: 255,
    metaType: 81,
    data: 500000
  },
  {
    deltaTime: 2880,
    type: 255,
    metaType: 81,
    data: 1000000
  },
  {
    deltaTime: 2880,
    type: 255,
    metaType: 81,
    data: 500000
  },
  {
    deltaTime: 3840,
    type: 255,
    metaType: 81,
    data: 1500000
  },
  {
    deltaTime: 7680,
    type: 255,
    metaType: 81,
    data: 300000
  },
  {
    deltaTime: 0,
    type: 255,
    metaType: 47
  }];
      const outputScore = midi2soap.parse(input);
      // console.log(outputScore);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=120
|4 TEMPO [1/4]=60
BAR 2
|3 TEMPO [1/4]=120
BAR 3
|3 TEMPO [1/4]=40
BAR 5
|3 TEMPO [1/4]=200 \
`;
      const expectedData = parseScore(expectedScore);
      assert.deepEqual(outputData, expectedData);
    });
  });
//   describe('# Curve Examples', () => {
//     it('# Curve begin on first beat', () => {
//       const input = `\
// 1, 4/4 60;
// 3, 4/4 120 80 3; \
// `;
//       const outputScore = midi2soap.parse(input);
//       const outputData = parseScore(outputScore);
//       const expectedScore = `\
// BAR 1 [4/4] TEMPO [1/4]=60
// BAR 3 TEMPO [1/4]=120 curve 1
// |4 TEMPO [1/4]=80 \
// `;
//       const expectedData = parseScore(expectedScore);
//       console.log(outputScore);
//       assert.deepEqual(outputData, expectedData);
//     });
//     it("# Curve don't begin on first beat", () => {
//       const input = `\
// 1, 4/4 60;
// 7, 3/4 50 80 2 2; \
// `;
//       const outputScore = midi2soap.parse(input);
//       const outputData = parseScore(outputScore);
//       const expectedScore = `\
// BAR 1 [4/4] TEMPO [1/4]=60
// BAR 7 [3/4] TEMPO [1/4]=50
// |2 TEMPO [1/4]=50 curve 1
// BAR 8 [4/4] TEMPO [1/4]=80 \
// `;
//       const expectedData = parseScore(expectedScore);
//       console.log(outputScore);
//       assert.deepEqual(outputData, expectedData);
//     });
//     it("Severals curves", () => {
//       const input = `\
// 1, 4/4 60;
// 20, 5/4 120 80.5 3 1 80.5 100 2 4; \
// `;
//       const outputScore = midi2soap.parse(input);
//       const outputData = parseScore(outputScore);
//       const expectedScore = `\
// BAR 1 [4/4] TEMPO [1/4]=60
// BAR 20 [5/4] TEMPO [1/4]=120 curve 1
// |4 TEMPO [1/4]=80 \
// `;
//       const expectedData = parseScore(expectedScore);
//       console.log(outputScore);
//       assert.deepEqual(outputData, expectedData);

//     });
//   })
});
