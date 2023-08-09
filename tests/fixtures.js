// ----------------------------------------------------------
// # BASICS
// ----------------------------------------------------------
// # Example 1

export const basicExample1Score = `BAR 1 [4/4] TEMPO [1/4]=60`;
export const basicExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[6/8]',
      upper: 6,
      lower: 8,
      defaultUnits: '[3/8][3/8]',
    },
    units: {
      value: '[3/8][3/8]',
      upper: [3, 3],
      lower: 8,
      numBeats: 2,
    },
    tempo: {
      basis: {
        value: '[3/8]',
        upper: 3,
        lower: 8,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[6/4]',
      upper: 6,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1, 1, 1],
      lower: 4,
      numBeats: 6,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 50,
      curve: null,
    },
    fermata: null,
    label: null
  },
];

export const basicExample5Score = `BAR 1 [3/16] TEMPO [1/16]=60`;
export const basicExample5Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[3/16]',
      upper: 3,
      lower: 16,
      defaultUnits: '[3/16]',
    },
    units: {
      value: '[3/16]',
      upper: [3],
      lower: 16,
      numBeats: 1,
    },
    tempo: {
      basis: {
        value: '[1/16]',
        upper: 1,
        lower: 16,
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: null
  }
];

// ----------------------------------------------------------
// ## Mesures à durées absolues
// ----------------------------------------------------------
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
    units: null,
    tempo: null,
    fermata: null,
    label: null
  },
  {
    bar: 2,
    beat: 1,
    duration: 7.5,
    signature: null,
    units: null,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
    duration: 10,
    // we keep signature, units and tempo, they just ignored if duration is set
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[3/4]',
      upper: 3,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4]',
      upper: [1, 1, 1],
      lower: 4,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null
  }
];

// # Example 2
export const absExemple3Score = `\
BAR 1 [4/4] TEMPO [1/4]=80
BAR 2 10s
BAR 3 "my-label" // check that duration is propagated
BAR 4 [3/4] \
`;

export const absExemple3Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
    // we keep signature and temp, it is just ignored as duration is set
    duration: 10,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: 'my-label'
  },
  {
    bar: 4,
    beat: 1,
    duration: null,
    signature: {
      value: '[3/4]',
      upper: 3,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4]',
      upper: [1, 1, 1],
      lower: 4,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null
  }
];
// ----------------------------------------------------------
// ## Labels
// ----------------------------------------------------------
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[3/4]',
      upper: 3,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4]',
      upper: [1, 1, 1],
      lower: 4,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[3/4]',
      upper: 3,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4]',
      upper: [1, 1, 1],
      lower: 4,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "section B"
  },
];

// ----------------------------------------------------------
// # Sub-divisions
// ----------------------------------------------------------
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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

export const subTips2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: "début du morceau",
  },
];


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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: {
      basis: {
        value: '[1/2]',
        upper: 1,
        lower: 2,
      },
      absDuration: 10,
      relDuration: null,
      suspended: null
    },
    label: null,
  },
  {
    bar: 4,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  }
];


export const fermataExample2Score = `\
BAR 1 [4/4]
|1 TEMPO [1/4]=120
|3 FERMATA [2/4]=? \
`;
export const fermataExample2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 1,
    beat: 3,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: {
      basis: {
        value: '[2/4]',
        upper: 2,
        lower: 4,
      },
      absDuration: null,
      relDuration: null,
      suspended: true,
    },
    label: null,
  },
  {
    bar: 2,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  }
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: {
      basis: {
        value: '[3/8]',
        upper: 3,
        lower: 8,
      },
      absDuration: null,
      relDuration: 2,
      suspended: null,
    },
    label: null,
  },
  {
    bar: 1,
    beat: 3.5,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];


// ----------------------------------------------------------
// # CHIFFRAGE A NUMERATEUR MULTIPLES
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
      value: '[3+2+2/8]',
      upper: 7,
      lower: 8,
      defaultUnits: '[3/8][2/8][2/8]',
    },
    units: {
      value: '[3/8][2/8][2/8]',
      upper: [3, 2, 2],
      lower: 8,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[3/8]',
        upper: 3,
        lower: 8,
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
      value: '[2+3+2/8]',
      upper: 7,
      lower: 8,
      defaultUnits: '[2/8][3/8][2/8]',
    },
    units: {
      value: '[2/8][3/8][2/8]',
      upper: [2, 3, 2],
      lower: 8,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[3/8]',
        upper: 3,
        lower: 8,
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
      value: '[2+2+3/8]',
      upper: 7,
      lower: 8,
      defaultUnits: '[2/8][2/8][3/8]',
    },
    units: {
      value: '[2/8][2/8][3/8]',
      upper: [2, 2, 3],
      lower: 8,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[3/8]',
        upper: 3,
        lower: 8,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: {
        start: { bar: 34, beat: 1, bpm: 80 },
        end: { bar: 36, beat: 1, bpm: 120 },
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];


export const tempoCurveExample2Score = `\
BAR 1 [4/4] TEMPO [1/4]=60 curve 1
BAR 2 [3/4]
// tempo equivalences are considered inside the curve
BAR 3 [6/8] TEMPO [3/8]=[1/4]
// new tempo definition defines the end of the curve
BAR 4 [2/4] TEMPO [1/4]=120 \
`;
export const tempoCurveExample2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 60,
      curve: {
        start: { bar: 1, beat: 1, bpm: 60 },
        end: { bar: 4, beat: 1, bpm: 120 },
        exponent: 1,
      },
    },
    fermata: null,
    label: null,
  },
  {
    bar: 2,
    beat: 1,
    duration: null,
    signature: {
      value: '[3/4]',
      upper: 3,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4]',
      upper: [1, 1, 1],
      lower: 4,
      numBeats: 3,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 60,
      curve: {
        start: { bar: 1, beat: 1, bpm: 60 },
        end: { bar: 4, beat: 1, bpm: 120 },
        exponent: 1,
      },
    },
    fermata: null,
    label: null,
  },
  {
    bar: 3,
    beat: 1,
    duration: null,
    signature: {
      value: '[6/8]',
      upper: 6,
      lower: 8,
      defaultUnits: '[3/8][3/8]',
    },
    units: {
      value: '[3/8][3/8]',
      upper: [3, 3],
      lower: 8,
      numBeats: 2,
    },
    tempo: {
      basis: {
        value: '[3/8]',
        upper: 3,
        lower: 8,
      },
      bpm: 60,
      curve: {
        start: { bar: 1, beat: 1, bpm: 60 },
        end: { bar: 4, beat: 1, bpm: 120 },
        exponent: 1,
      },
    },
    fermata: null,
    label: null,
  },
  {
    bar: 4,
    beat: 1,
    duration: null,
    signature: {
      value: '[2/4]',
      upper: 2,
      lower: 4,
      defaultUnits: '[1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4]',
      upper: [1, 1],
      lower: 4,
      numBeats: 2,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 120,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];

// -----------------------------------------------------
// # Equivalences de tempo
// -----------------------------------------------------

export const tempoEquivalenceExample1Score = `\
BAR 1 [4/4] TEMPO [1/4]=80
BAR 2 [6/8] TEMPO [3/8]=[1/4] \
`;

export const tempoEquivalenceExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
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
      value: '[6/8]',
      upper: 6,
      lower: 8,
      defaultUnits: '[3/8][3/8]',
    },
    units: {
      value: '[3/8][3/8]',
      upper: [3, 3],
      lower: 8,
      numBeats: 2,
    },
    tempo: {
      basis: {
        value: '[3/8]',
        upper: 3,
        lower: 8,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null,
  }
];

// -----------------------------------------------------
// # End score
// -----------------------------------------------------

export const endScoreExample1Score = `\
BAR 1 [4/4] TEMPO [1/4]=80
// stop at the end of bar 2
BAR 2 END \
`;

export const endScoreExample1Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 2,
    beat: 1,
    end: true,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];

export const endScoreExample2Score = `\
BAR 1 [4/4] TEMPO [1/4]=80
// stop at the end of bar 2
BAR 2 |3 END \
`;

export const endScoreExample2Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
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
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null
  },
  {
    bar: 2,
    beat: 3,
    end: true,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 80,
      curve: null,
    },
    fermata: null,
    label: null,
  },
];

export const endScoreExample3Score = `\
BAR 1 [4/4] TEMPO [1/4]=60 |4.5 "coucou" END
`;

export const endScoreExample3Data = [
  {
    bar: 1,
    beat: 1,
    duration: null,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: null,
  },
  {
    bar: 1,
    beat: 4.5,
    duration: null,
    end: true,
    signature: {
      value: '[4/4]',
      upper: 4,
      lower: 4,
      defaultUnits: '[1/4][1/4][1/4][1/4]',
    },
    units: {
      value: '[1/4][1/4][1/4][1/4]',
      upper: [1, 1, 1, 1],
      lower: 4,
      numBeats: 4,
    },
    tempo: {
      basis: {
        value: '[1/4]',
        upper: 1,
        lower: 4,
      },
      bpm: 60,
      curve: null,
    },
    fermata: null,
    label: "coucou"
  },
]


// -----------------------------------------------------
// # Augustin exemple compliqué
// -----------------------------------------------------

export const augustinExampleScore = `\
// testscore.txt
BAR 1 2s
BAR 3 [4/4] TEMPO [1/4]=120 curve 1
|4 TEMPO [1/4]=80
BAR 5 [3/8] TEMPO [1/8]=160
BAR 6 [1/8] TEMPO [1/8]=100
BAR 7 [3/4] TEMPO [1/4]=50
|2 TEMPO [1/4]=50 curve 1
BAR 8 [7/8] TEMPO [1/8]=80
BAR 9 [4/4] TEMPO [1/4]=60
BAR 10 TEMPO [1/4]=60 curve 1
BAR 11 [3/4] TEMPO [1/4]=120
BAR 12 [7/4]
|3 TEMPO [1/4]=120 curve 1
|6 TEMPO [1/4]=60
BAR 13 [4/4]
BAR 15 FERMATA [1/1]=?
BAR 16 2s
BAR 17 15s
BAR 18 [3/4] TEMPO [1/4]=63.5
BAR 19 [4/4]
BAR 20 [5/4] TEMPO [1/4]=120 curve 1
|4 TEMPO [1/4]=80.5 curve 1
BAR 21 TEMPO [1/4]=100
BAR 30 [4/4] TEMPO [1/4]=120
|3 TEMPO [1/4]=120 curve 1
BAR 31 [2/4] TEMPO [1/4]=120
BAR 32 [6/8]
BAR 33
|3 TEMPO [1/8]=60 \
`;
