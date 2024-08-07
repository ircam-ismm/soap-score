import { assert } from 'chai';

import soap2asco from '../src/parsers/soap2asco.js';
import { writeScore } from '../src/soap-score-writer.js';
import { parseScore } from '../src/soap-score-parser.js';
import * as fixtures from '../src/utils/fixtures.js';

describe('soap.writeScore', () => {
  describe('# Basics', () => {
    it(`## Example 1`, () => {
      const data = `\
BAR 1 [4/4] TEMPO [1/4]=90 END \
`;
      const expected = `\
BPM 90
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 1\n`;

      const ascoScore = soap2asco.parse(data);
      // console.log(JSON.stringify(ascoScore));
      // console.log(JSON.stringify(expected));
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 2`, () => {
      const data = `\
BAR 1 [6/8] TEMPO [3/8]=60 END \
`;
      const expected = `\
BPM 90
NOTE 60 1.5 MEASURE_1
NOTE 61 1.5\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 2bis`, () => {
      const data = `\
BAR 1 [6/8] TEMPO [1/8]=120 END \
`;
      const expected = `\
BPM 60
NOTE 60 1.5 MEASURE_1
NOTE 61 1.5\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 2ter`, () => {
      const data = `\
BAR 1 [6/8] TEMPO [1/4]=60 END \
`;
      const expected = `\
BPM 60
NOTE 60 1.5 MEASURE_1
NOTE 61 1.5\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 2quater`, () => {
      const data = `\
BAR 1 [5/8] TEMPO [1/4]=60 END \
`;
      const expected = `\
BPM 60
NOTE 60 1.5 MEASURE_1
NOTE 61 1\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it('## Example 2quinter', () => {
      const data = `\
BAR 1 [3+3+2+2/8] TEMPO [1/4]=60 END \
`;
      const expected = `\
BPM 60
NOTE 60 1.5 MEASURE_1
NOTE 61 1.5
NOTE 62 1
NOTE 63 1\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 3`, () => {
      const data = `BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 [6/4]
BAR 4 [4/4] END \
`;
      const expected = `\
BPM 120
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_2
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_3
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 64 1
NOTE 65 1
NOTE 60 1 MEASURE_4
NOTE 61 1
NOTE 62 1
NOTE 63 1\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 4`, () => {
      const data =`\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 TEMPO [1/4]=50 END \
`;
      const expected = `\
BPM 120
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_2
NOTE 61 1
NOTE 62 1
NOTE 63 1
BPM 50
NOTE 60 1 MEASURE_3
NOTE 61 1
NOTE 62 1
NOTE 63 1\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });
  });

  describe('# Absolute measures', () => {
    it('# Example 1', () => {
      const data =`\
BAR 1 10s
BAR 2 7.5s END \
`;
      const expected = `\
BPM 60
NOTE 60 10 MEASURE_1
NOTE 60 7.5 MEASURE_2\n`;

      const ascoScore = soap2asco.parse(data);
      // console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it('# Example 2', () => {
      const data =`\
BAR 1 [4/4] TEMPO [1/4]=80
BAR 2 10s
BAR 3 [3/4] END \
`;

      const expected = `\
BPM 80
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 1
BPM 60
NOTE 60 10 MEASURE_2
BPM 80
NOTE 60 1 MEASURE_3
NOTE 61 1
NOTE 62 1\n`;

      const ascoScore = soap2asco.parse(data);
      // console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    })
  });

  describe('# Labels', () => {
    it(`## Example 1`, () => {
      const data =`\
BAR 1 [4/4] TEMPO [1/4]=120 "section A"
BAR 2 "section B" END \
`;
      const expected = `\
BPM 120
NOTE 60 1 MEASURE_1 "section A"
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_2 "section B"
NOTE 61 1
NOTE 62 1
NOTE 63 1\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 1bis`, () => {
      const data =`\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 TEMPO [1/4]=50 END \
`;
      const expected = `\
BPM 120
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_2
NOTE 61 1
NOTE 62 1
NOTE 63 1
BPM 50
NOTE 60 1 MEASURE_3
NOTE 61 1
NOTE 62 1
NOTE 63 1\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it('## Example 2', () => {
      const data =`\
BAR 1 [4/4] TEMPO [1/4]=120 "section A"
BAR 2 [3/4]
BAR 3 "section B" END \
`;
      const expected = `\
BPM 120
NOTE 60 1 MEASURE_1 "section A"
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_2
NOTE 61 1
NOTE 62 1
NOTE 60 1 MEASURE_3 "section B"
NOTE 61 1
NOTE 62 1\n`;

      const ascoScore = soap2asco.parse(data);
      //console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });
  });

  describe('# Bar Subdivisions', () => {
    it(`## Example 1`, () => {
      const data =`\
BAR 1 [4/4] TEMPO [1/4]=120 "To Flute"
|3 "To Piccolo"
|4 END \
`;
      const expected = `\
BPM 120
NOTE 60 1 MEASURE_1 "To Flute"
NOTE 61 1
NOTE 62 1 "To Piccolo"
NOTE 63 1\n`;

      const ascoScore = soap2asco.parse(data);
      // console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });

    it(`## Example 2`, () => {
      const data =`\
BAR 1 [4/4] TEMPO [1/4]=120
|4.5 "accent" |4.5 END \
`;
      const expected = `\
BPM 120
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 0.5
NOTE 0 0.5 "accent"\n`;

      const ascoScore = soap2asco.parse(data);
      // console.log(ascoScore);
      assert.deepEqual(ascoScore, expected);
    });
  });

    describe('# Fermata', () => {
      it(`## Example 1`, () => {
        const data =`\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3
|3 FERMATA [1/2]=10s
BAR 4 END \
`;
        const expected = `\
BPM 120
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_2
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 1 MEASURE_3
NOTE 61 1
NOTE 62 20
NOTE 60 1 MEASURE_4
NOTE 61 1
NOTE 62 1
NOTE 63 1\n`;

        const ascoScore = soap2asco.parse(data);
        //console.log(ascoScore);
        assert.deepEqual(ascoScore, expected);
      });
      it.skip(`## Example 2 - Still dont know how to programm a pause in antescofo`, () => {
        const data =`\
BAR 1 [4/4]
|1 TEMPO [1/4]=120
|2 FERMATA [3/8]=?
|3 END \
`;
        const expected = `\
BPM 120
NOTE 60 1 MEASURE_1
NOTE 61 1
EVENT 0
NOTE 63 1 \
`;
        const ascoScore = soap2asco.parse(data);
        //console.log(ascoScore);
        assert.deepEqual(ascoScore, expected);
      });
      it(`## Example 3`, () => {
        const data =`\
BAR 1 [4/4]
|1 TEMPO [1/4]=120
|2 FERMATA [3/8]=2*
|3 END \
`;
        const expected = `\
BPM 120
NOTE 60 1 MEASURE_1
NOTE 61 3
NOTE 0 0.5
NOTE 63 1
\
`;
        const ascoScore = soap2asco.parse(data);
        // console.log(ascoScore);
        assert.deepEqual(ascoScore, expected);
      });
    });
    describe('# CHIFFRAGE A NUMERATEUR MULTIPLES', () => {
      it('## Example 1', () => {
        const data =`\
BAR 1 [3+2+2/8] TEMPO [3/8]=60
BAR 2 [2+3+2/8]
BAR 3 [2+2+3/8] END\
`;
        const expected = `\
BPM 90
NOTE 60 1.5 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 60 1 MEASURE_2
NOTE 61 1.5
NOTE 62 1
NOTE 60 1 MEASURE_3
NOTE 61 1
NOTE 62 1.5\n`;

        const ascoScore = soap2asco.parse(data);
        //console.log(ascoScore);
        assert.deepEqual(ascoScore, expected);
      });
    });
    describe('# Tempo Curves', () => {
      it('## Example 1', () => {
        const data =`\
BAR 1 [4/4] TEMPO [1/4]=80
BAR 2 TEMPO [1/4]=80 curve 1
BAR 3 TEMPO [1/4]=120 END \
`;
        const expected = `\
BPM 80
NOTE 60 1 MEASURE_1
NOTE 61 1
NOTE 62 1
NOTE 63 1
NOTE 60 0.9090909090909091 MEASURE_2
NOTE 61 0.8333333333333334
NOTE 62 0.7692307692307692
NOTE 63 0.7142857142857143
BPM 120
NOTE 60 1 MEASURE_3
NOTE 61 1
NOTE 62 1
NOTE 63 1\n`;

        const ascoScore = soap2asco.parse(data);
        // console.log(ascoScore);
        assert.deepEqual(ascoScore, expected);
      });
    });
});
