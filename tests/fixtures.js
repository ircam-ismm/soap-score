// ## Basics
// # Example 1

export const basicExample1Score = `BAR 1 [4/4] TEMPO [1/4]=60`;
export const basicExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];

// # Example 2
export const basicExample2Score = `BAR 1 [6/8] TEMPO [3/8]=60`;
export const basicExample2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '6/8',
      type: 'compound',
      upper: 6,
      lower: 8,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '3/8',
        type: 'compound',
        upper: 3,
        lower: 8,
        additive: []
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: null
  }
];

// # Example 3
export const basicExample3Score = `\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 [6/4]
BAR 4 [4/4] \
`;
export const basicExample3Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null
  },
  {
    bar: 3,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '6/4',
      type: 'simple',
      upper: 6,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null
  },
  {
    bar: 4,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null
  }
];

// # Example 4
export const basicExample4Score = `\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3 TEMPO [1/4]=50 \
`;
export const basicExample4Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null
  },
  {
    bar: 3,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 50,
      curve: null,
    },
    fermata: null,
    label: null
  },
];

// ## Mesures à durées absolues
// # Example 1
export const absExemple1Score = `\
BAR 1 10s
BAR 2 7.5s \
`;

export const absExemple1Data = [
  {
    bar: 1,
    beat: 1,
    duration: 10,
    signature: null,
    tempo: null,
    fermata: null,
    label: null
  },
  {
    bar: 2,
    beat: 1,
    duration: 7.5,
    signature: null,
    tempo: null,
    fermata: null,
    label: null
  }
];

// # Example 2
export const absExemple2Score = `\
BAR 1 [4/4] TEMPO [1/4]=80
BAR 2 10s
BAR 3 [3/4] \
`;

export const absExemple2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null
  },
  {
    bar: 2,
    beat: 1,
    // we keep signature and temp, it is just ignored as duration is set
    duration: 10,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null
  },
  {
    bar: 3,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '3/4',
      type: 'simple',
      upper: 3,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null
  }
];
// ## Labels
// # Example 1
export const labelExample1Score = `\
BAR 1 [4/4] TEMPO [1/4]=120 "section A"
BAR 2 "section B" \
`;
export const labelExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "section A"
  },
  {
    bar: 2,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "section B"
  },
];

// LABEL can be explicit
export const labelExample1bisScore = `\
BAR 1 [4/4] TEMPO [1/4]=120 LABEL "section A"
BAR 2 LABEL "section B" \
`;
export const labelExample1bisData = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "section A"
  },
  {
    bar: 2,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "section B"
  },
];

// # Example 2

export const labelExample2Score = `\
BAR 1 [4/4] TEMPO [1/4]=120 "section A"
BAR 2 [3/4]
BAR 3 "section B" \
`;

export const labelExample2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "section A"
  },
  {
    bar: 2,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '3/4',
      type: 'simple',
      upper: 3,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null
  },
  {
    bar: 3,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '3/4',
      type: 'simple',
      upper: 3,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "section B"
  },
];


// # Sub-divisions
// # Example 1

export const subExample1Score = `\
BAR 1 [4/4] TEMPO [1/4]=120 "To Flute"
|3 "To Piccolo" \
`;

export const subExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "To Flute"
  },
  {
    bar: 1,
    beat: 3,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "To Piccolo"
  },
];

// # Example 2
export const subExample2Score = `\
BAR 1 [4/4] TEMPO [1/4]=120
|4.5 "accent" \
`;
export const subExample2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 1,
    beat: 4.5,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "accent"
  },
];


// # Tips 1

export const subTips1Score1 = `\
BAR 1 [4/4]
| TEMPO [1/4]=120 \
`;
export const subTips1Score2 = `\
BAR 1 [4/4]
|1 TEMPO [1/4]=120 \
`;
export const subTips1Score3 = `\
BAR 1 [4/4] TEMPO [1/4]=120 \
`;
export const subTips1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
]


// # Tips 2

export const subTips2Score1 = `\
BAR 1 [4/4]
| TEMPO [1/4]=120
| "début du morceau" \
`;

export const subTips2Score2 = `\
BAR 1 [4/4]
| TEMPO [1/4]=120 "début du morceau" \
`;


// ----------------------------------------------------------
// # FERMATA
// ----------------------------------------------------------

export const fermataExample1Score = `\
BAR 1 [4/4] TEMPO [1/4]=120
BAR 3
|3 FERMATA [1/2]=10s \
`;
export const fermataExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 3,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 3,
    beat: 3,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: {
      basis: {
        empty: false,
        name: '1/2',
        type: 'simple',
        upper: 1,
        lower: 2,
        additive: []
      },
      absDuration: 10,
      relDuration: null,
      suspended: null
    },
    label: null,
  },
];


export const fermataExample2Score = `\
BAR 1 [4/4]
|1 TEMPO [1/4]=120
|2 FERMATA [3/8]=? \
`;
export const fermataExample2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 1,
    beat: 2,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: {
      basis: {
        empty: false,
        name: '3/8',
        type: 'compound',
        upper: 3,
        lower: 8,
        additive: []
      },
      absDuration: null,
      relDuration: null,
      suspended: true,
    },
    label: null,
  },
];


export const fermataExample3Score = `\
BAR 1 [4/4]
|1 TEMPO [1/4]=120
|2 FERMATA [3/8]=2* \
`;
export const fermataExample3Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 1,
    beat: 2,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: {
      basis: {
        empty: false,
        name: '3/8',
        type: 'compound',
        upper: 3,
        lower: 8,
        additive: []
      },
      absDuration: null,
      relDuration: 2,
      suspended: null,
    },
    label: null,
  },
];


// ----------------------------------------------------------
// # MESURES COMPOSÉES
// ----------------------------------------------------------

export const composedExample1Score = `\
BAR 1 [3+2+2/8] TEMPO [3/8]=60
BAR 2 [2+3+2/8]
BAR 3 [2+2+3/8] \
`;
export const composedExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '3+2+2/8',
      type: 'irregular',
      upper: 7,
      lower: 8,
      additive: [3, 2, 2],
    },
    tempo: {
      basis: {
        empty: false,
        name: '3/8',
        type: 'compound',
        upper: 3,
        lower: 8,
        additive: [],
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 2,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '2+3+2/8',
      type: 'irregular',
      upper: 7,
      lower: 8,
      additive: [2, 3, 2],
    },
    tempo: {
      basis: {
        empty: false,
        name: '3/8',
        type: 'compound',
        upper: 3,
        lower: 8,
        additive: [],
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 3,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '2+2+3/8',
      type: 'irregular',
      upper: 7,
      lower: 8,
      additive: [2, 2, 3],
    },
    tempo: {
      basis: {
        empty: false,
        name: '3/8',
        type: 'compound',
        upper: 3,
        lower: 8,
        additive: [],
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];

// ----------------------------------------------------------
// # COURBES DE TEMPO
// ----------------------------------------------------------

export const tempoCurveExample1Score = `\
BAR 33 [4/4] TEMPO [1/4]=80
BAR 34 TEMPO [1/4]=80 curve 1.5
BAR 36 TEMPO [1/4]=120 \
`;
export const tempoCurveExample1Data = [
  {
    bar: 33,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 34,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 80,
      curve: {
        start: { bar: 34, beat: 1 },
        end: { bar: 36, beat: 1 },
        exponent: 1.5,
      },
    },
    fermata: null,
    label: null,
  },
  {
    bar: 36,
    beat: 1,
    duration: null,
    signature: {
      empty: false,
      name: '4/4',
      type: 'simple',
      upper: 4,
      lower: 4,
      additive: []
    },
    tempo: {
      basis: {
        empty: false,
        name: '1/4',
        type: 'simple',
        upper: 1,
        lower: 4,
        additive: []
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];
