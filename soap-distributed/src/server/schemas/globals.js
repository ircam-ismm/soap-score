export default {
  transportCommand: {
    type: 'string', // 'start', 'stop', 'pause'
    default: 'stop',
    filterChange: false, // we want to be able to seek as many time as we want
  },
  seekPosition: {
    type: 'float',
    default: 0,
    filterChange: false,
  },
  transportEvents: {
    type: 'any',
    default: null,
    nullable: true,
  },
  // store transport current state and scheduled events to restore new clients
  // transport in the current globals app state
  transportState: {
    type: 'any',
    default: {},
  },

  // mtcApplyAt: {
  //   type: 'float',
  //   event: true,
  // },
  // enablePreRoll: {
  //   type: 'boolean',
  //   default: false,
  // },
  // preRollDuration: {
  //   type: 'float',
  //   default: 4,
  //   min: 0,
  // },
  // preRollEvents: {
  //   type: 'any',
  //   default: null,
  //   nullable: true,
  // },
  // loopStart: {
  //   type: 'float',
  //   default: 0,
  // },
  // loopEnd: {
  //   type: 'float',
  //   default: 0,
  // },
  // loop: {
  //   type: 'boolean',
  //   default: false,
  // },

  score: {
    type: 'string',
    default: 'BAR 1 [4/4] TEMPO [1/4]=60',
  },
  scores: {
    type: 'any',
    default: {},
  },
};
