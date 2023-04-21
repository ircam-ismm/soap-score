import { assert } from 'chai';

import augustin2soap from '../src/parsers/augustin2soap.js';
import { writeScore } from '../src/soap-score-writer.js';
import { parseScore } from '../src/soap-score-parser.js';

describe('soap.parse.augustin2soap', () => {
  describe('# Simple Examples', () => {
    it('## Example 1', () => {
      const input = `0, 4/4 60;`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `BAR 1 [4/4] TEMPO [1/4]=60`;
      const expectedData = parseScore(expectedScore);
      //console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## Timer', () => {
      const input = `0, timer 2000;`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `BAR 1 2s`;
      const expectedData = parseScore(expectedScore);
      //console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## Timer 2', () => {
      const input = `0, timer 0:15;`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `BAR 1 15s`;
      const expectedData = parseScore(expectedScore);
      //console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    })
    it('## Fermata', () => {
      const input = `\
0, 4/4 60;
15, fermata; \
`;
      const outputScore = augustin2soap.parse(input);
      //console.log(outputScore);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 16 FERMATA [1/1]=? \
`;
      const expectedData = parseScore(expectedScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## Only TimeSignature', () => {
      const input = `\
0, 4/4 60;
5, 2/4; \
`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 6 [2/4] \
`;
      const expectedData = parseScore(expectedScore);
      //console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it('## A little bit of everything', () => {
      const input = `\
0, 4/4 60;
3, timer 2000;
4, 3/8 160;
5, 1/8 100;
7, 7/8 160;
8, 4/4 60;
10, 3/4 120;
12, 4/4 60;
14, fermata;
15, timer 2000;
16, timer 0:15;
17, 3/4 63.5;
18, 4/4;
30, 2/4;
31, 6/8; \
`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 4 2s
BAR 5 [3/8] TEMPO [1/8]=160
BAR 6 [1/8] TEMPO [1/8]=100
BAR 8 [7/8] TEMPO [1/8]=160
BAR 9 [4/4] TEMPO [1/4]=60
BAR 11 [3/4] TEMPO [1/4]=120
BAR 13 [4/4] TEMPO [1/4]=60
BAR 15 FERMATA [1/1]=?
BAR 16 2s
BAR 17 15s
BAR 18 [3/4] TEMPO [1/4]=63.5
BAR 19 [4/4]
BAR 31 [2/4]
BAR 32 [6/8] \
`;
      const expectedData = parseScore(expectedScore);
      //console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    })
  });
  describe('# Curve Examples', () => {
    it('# Curve begin on first beat', () => {
      const input = `\
0, 4/4 60;
2, 4/4 120 80 3; \
`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 3 TEMPO [1/4]=120 curve 1
|4 TEMPO [1/4]=80 \
`;
      const expectedData = parseScore(expectedScore);
      // console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it.only('# Curve begin on first beat', () => {
      const input = `\
0, 4/4 60;
2, 4/4 120 80 5; \
`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 3 TEMPO [1/4]=120 curve 1
BAR 4
|2 TEMPO [1/4]=80 \
`;
      const expectedData = parseScore(expectedScore);
      // console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it("# Curve don't begin on first beat", () => {
      const input = `\
0, 4/4 60;
6, 3/4 50 80 2 2; \
`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 7 [3/4] TEMPO [1/4]=50
|2 TEMPO [1/4]=50 curve 1
BAR 8 [3/4] TEMPO [1/4]=80 \
`;
      const expectedData = parseScore(expectedScore);
      //console.log(outputScore);
      assert.deepEqual(outputData, expectedData);
    });
    it("Severals curves", () => {
      const input = `\
0, 4/4 60;
19, 5/4 120 80.5 3 1 80.5 100 2 4; \
`;
      const outputScore = augustin2soap.parse(input);
      const outputData = parseScore(outputScore);
      const expectedScore = `\
BAR 1 [4/4] TEMPO [1/4]=60
BAR 20 [5/4] TEMPO [1/4]=120 curve 1
|4 TEMPO [1/4]=80 \
`;
      const expectedData = parseScore(expectedScore);
      //console.log(outputScore);
      assert.deepEqual(outputData, expectedData);

    });
  })
});
