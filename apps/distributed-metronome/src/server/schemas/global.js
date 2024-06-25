export default {
  //   guiState: {
  //   type: 'any',
  //   default: {
  //     transport: 'stop',
  //     // seek: 0,
  //     // loopStart: 0,
  //     // loopEnd: 0,
  //     // loop: false,
  //   },
  // },
  score: {
    type: 'string',
    default: 'BAR 1 [4/4] TEMPO [1/4]=90',
  },
  transportControl: {
    type: 'any', // [command, value]
    event: true,
  },
  transportState: {
    type: 'any',
    default: null,
    nullable: true,
  },
  transportEvents: {
    type: 'any',
    default: null,
    nullable: true,
  },
}
