import SoapScoreInterpreter from '../SoapScoreInterpreter.js';

const soap2asco = {
  /**
   * we want to use the parser client side, so let comment that for now
   * @todo - use package.json exports to create a monkey patched version for node
   */
  // fromFile: function(input, output) {
  //   if (!fs.existsSync(input)) {
  //     throw new Error(`Invlid input file ${input}, does not exists`);
  //   }

  //   const score = fs.readFileSync(input).toString();
  //   const soapScore = this.parse(score);

  //   fs.writeFileSync(output, soapScore);
  // },

  parse: function(score, comment = false) {
    const interpreter = new SoapScoreInterpreter(score);
    let isEndOfScore = false;

    // check to event.label === 'end-of-score' and throw error if not
    interpreter.score.forEach( (e) => {
      if (e.end) {
        isEndOfScore = true;
      }
    });

    if (isEndOfScore === false) {
      throw new Error('Error: Cannot export file, no END tag found');
    }

    let output = ``;
    let currentBar = null;
    let currentBeat = null;
    let currentEvent = {
      bar: null,
      beat: null,
      signature: null,
      duration: null,
      tempo: {
        basis: null,
        bpm: null,
        curve: null,
      },
      fermata: null,
      label: null,
    };

    while (true) {
      let infos = null;
      if (!currentBar) {
        infos = interpreter.getLocationInfos(1, 1);
      } else {
        infos = interpreter.getNextLocationInfos(currentBar, currentBeat);
      }

      if (infos === null) {
        return output;
      }

      const { bar, beat, event, position, duration, dt, unit } = infos;

      if (event.duration) {
        // absolute measure
        event.tempo = {
          bpm:60,
          basis:{
            upper: 1,
            lower: 4,
          },
        };
        // output += `BPM 60\n`
      }

      if (bar !== currentBar && comment === true) {
        output += `
; ----------- measure ${bar} --- time signature ${event.signature.name} -----------
`;
      }

      // check if tempo has changed
      if (event !== currentEvent && event.tempo && event.tempo.bpm !== currentEvent.tempo.bpm) {
        // bpm in antescofo -> related to quarter note
        const bpm = event.tempo.bpm * (event.tempo.basis.upper / event.tempo.basis.lower) * 4
        output += `BPM ${bpm}\n`;
      };

      let dtInBeat;

      if (event.duration === null) {
        // in antescofo a unit is quarter note, so we just need to normalize
        // our unit according to a quarter node
        const { upper, lower } = unit;
        const unitNormToQuarterNote = (upper / lower) / (1 / 4);
        // but this may be an in-between full beat event, we need to take that into account
        const tempoBasisDuration = 60 / event.tempo.bpm;
        // number of tempo basis unit
        const ratio = (upper / lower) / (event.tempo.basis.upper / event.tempo.basis.lower);
        const beatDuration = ratio * tempoBasisDuration;

        dtInBeat = unitNormToQuarterNote * (dt / beatDuration);
      } else {
        dtInBeat = event.duration;
      }

      let ascoNote = 0;

      if (beat - Math.floor(beat) === 0) {
        ascoNote = beat + 59;
      }

      if (bar !== currentBar) {
        output += `NOTE ${ascoNote} ${dtInBeat} MEASURE_${bar}`;
      } else {
        output += `NOTE ${ascoNote} ${dtInBeat}`;
      }

      // check for a label
      if (event !== currentEvent && event.label) {
        output += ` "${event.label}"\n`;
      } else {
        output += `\n`;
      };

      if (event !== currentEvent) {
        currentEvent = event;
      };

      currentBar = bar;
      currentBeat = beat;
    }
  },
};

export default soap2asco;


