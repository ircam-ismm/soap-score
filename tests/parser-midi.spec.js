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
      //console.log(outputScore);
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
      //console.log(outputScore);
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
      //console.log(outputScore);
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
      //console.log(outputScore);
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
      //console.log(outputScore);
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
      //console.log(outputScore);
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
      //console.log(outputScore);
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
      // //console.log(outputScore);
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
    it('## Matalon Traces IX', () => {
      const input = [
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 1,
    "data": "Traces IX"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 84,
    "data": [
      64,
      0,
      0,
      0,
      0
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      2,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 1071428
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 28800,
    "type": 255,
    "metaType": 88,
    "data": [
      5,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 2400,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 36480,
    "type": 255,
    "metaType": 1,
    "data": "cello open"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 1071429
  },
  {
    "deltaTime": 11520,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 1920,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 1440,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 4800,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 2160,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 19200,
    "type": 255,
    "metaType": 88,
    "data": [
      2,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 480,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 81,
    "data": 6000013
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 81,
    "data": 1071428
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 1440,
    "type": 255,
    "metaType": 1,
    "data": "cello last leak"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 15360,
    "type": 255,
    "metaType": 88,
    "data": [
      2,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 480,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 2160,
    "type": 255,
    "metaType": 1,
    "data": "cello scordatura"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 26880,
    "type": 255,
    "metaType": 88,
    "data": [
      2,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 1,
    "data": "cello mont /sulpont"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 1000000
  },
  {
    "deltaTime": 2880,
    "type": 255,
    "metaType": 1,
    "data": "cello legno/wood"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 23040,
    "type": 255,
    "metaType": 1,
    "data": "ENDE/bruitages"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      3,
      12,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 2857143
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 47
  }];
      const outputScore = midi2soap.parse(input, 480);
      // //console.log(outputScore);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [2/4] TEMPO [1/4]=56 "Traces IX"
BAR 2 [4/4]
BAR 17 [5/4]
BAR 18 [4/4]
BAR 37 [3/4] "cello open"
BAR 45 [4/4]
BAR 46 [3/4]
BAR 47 [4/8]
BAR 52 [3/8]
BAR 55 [4/8]
BAR 75 [2/8]
BAR 76 [4/8]
BAR 77 TEMPO [1/4]=10
BAR 78 TEMPO [1/4]=56
BAR 79 [3/8]
BAR 81 [4/8] "cello last leak"
BAR 97 [2/8]
BAR 98 [3/8]
BAR 101 [4/4] "cello scordatura"
BAR 115 [2/4]
BAR 116 [3/8] TEMPO [1/4]=60 "cello mont /sulpont"
BAR 120 [4/8] "cello legno/wood"
BAR 144 [3/8] TEMPO [1/4]=21 "ENDE/bruitages" \
`;
      const expectedData = parseScore(expectedScore);
      assert.deepEqual(outputData, expectedData);

    });

    it("## Sample Score.MID", () => {
      const input = [
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 3,
    "data": "sample_score"
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 752266
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 6,
    "data": "debut"
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 81,
    "data": 666667
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 81,
    "data": 333333
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      5,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 1000000
  },
  {
    "deltaTime": 480,
    "type": 255,
    "metaType": 6,
    "data": "TOTO"
  },
  {
    "deltaTime": 3360,
    "type": 255,
    "metaType": 81,
    "data": 3000000
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      1,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 500000
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 500000
  },
  {
    "deltaTime": 11520,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      3,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 375000
  },
  {
    "deltaTime": 1440,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 375000
  },
  {
    "deltaTime": 3840,
    "type": 255,
    "metaType": 88,
    "data": [
      1,
      3,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 1200000
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 1000000
  },
  {
    "deltaTime": 7680,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 500000
  },
  {
    "deltaTime": 17280,
    "type": 255,
    "metaType": 88,
    "data": [
      4,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 500000
  },
  {
    "deltaTime": 3840,
    "type": 255,
    "metaType": 88,
    "data": [
      3,
      2,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 944882
  },
  {
    "deltaTime": 8640,
    "type": 255,
    "metaType": 88,
    "data": [
      6,
      3,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 500000
  },
  {
    "deltaTime": 4800,
    "type": 255,
    "metaType": 6,
    "data": "dernier temps du 6 8"
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      12,
      3,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 500000
  },
  {
    "deltaTime": 4800,
    "type": 255,
    "metaType": 6,
    "data": "dernier temps du 12 8"
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 88,
    "data": [
      9,
      3,
      24,
      8
    ]
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 81,
    "data": 600000
  },
  {
    "deltaTime": 2880,
    "type": 255,
    "metaType": 81,
    "data": 1000000
  },
  {
    "deltaTime": 960,
    "type": 255,
    "metaType": 6,
    "data": "dernier temps du 9 8"
  },
  {
    "deltaTime": 480,
    "type": 255,
    "metaType": 81,
    "data": 500000
  },
  {
    "deltaTime": 0,
    "type": 255,
    "metaType": 47
  }];
      const outputScore = midi2soap.parse(input);
      // //console.log("result ", outputScore);
      const expectedScore = `\
BAR 1 [3/4] TEMPO [1/4]=79.759 "debut"
|2 TEMPO [1/4]=90
|3 TEMPO [1/4]=180
BAR 2 [5/4] TEMPO [1/4]=60
|1.5 "TOTO"
|5 TEMPO [1/4]=20
BAR 3 [1/4] TEMPO [1/4]=120
BAR 4 [4/4]
BAR 7 [3/8] TEMPO [1/4]=160
BAR 8 [4/4]
BAR 9 [1/8] TEMPO [1/4]=50
BAR 11 [4/4] TEMPO [1/4]=60
BAR 13 [3/4] TEMPO [1/4]=120
BAR 19 [4/4]
BAR 20 [3/4] TEMPO [1/4]=63.5
BAR 23 [6/8] TEMPO [1/4]=120
BAR 24
|3 "dernier temps du 6 8"
BAR 25 [12/8]
|6 "dernier temps du 12 8"
BAR 26 [9/8] TEMPO [1/4]=100
|4 TEMPO [1/4]=60
|5 "dernier temps du 9 8"
BAR 27 TEMPO [1/4]=120 \
`;
      const expectedData = parseScore(expectedScore);
      // //console.log("expected \n", expectedScore);
      const outputData = parseScore(outputScore);
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
//       //console.log(outputScore);
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
//       //console.log(outputScore);
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
//       //console.log(outputScore);
//       assert.deepEqual(outputData, expectedData);

//     });
//   })
});
