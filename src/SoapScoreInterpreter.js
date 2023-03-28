

class SoapScoreInterpreter {
  constructor(score) {
    this.score = score;

    // should never change at this point
    this._labels = score.filter(e => e.type === 'LABEL').map(e => e.label);
  }

  _computeDurationFromPosition(
    lastBar,
    lastBeat,
    nextBar,
    nextBeat,
    barSignature,
    tempoBpm,
    tempoBasis
  ) {
    // no need to do anything, we are at the same location
    if (lastBar === nextBar && lastBeat === nextBeat) {
      return 0;
    }

    const basisDuration = 60 / tempoBpm;

    const numBasisInBar = (barSignature.upper / barSignature.lower) /
      (tempoBasis.upper / tempoBasis.lower);

    const barDuration = numBasisInBar * basisDuration;

    const numBarNormalized = (nextBar - (lastBar + 1))
      + (1 - (lastBeat - 1) / barSignature.upper)
      + ((nextBeat - 1) / barSignature.upper);

    return numBarNormalized * barDuration;
  }

  getLabels() {
    return this._labels;
  }

  getLocationAtLabel(label) {
    const event = this.score.find(event => event.label === label);

    if (event) {
      return { bar: event.bar, beat: event.beat };
    } else {
      return null;
    }
  }

  // return bar and beat just before the given position
  getLocationAtPosition(targetPosition) {
    if (targetPosition < 0) {
      throw new Error('Invalid target position, cannot be negative');
    }

    let position = 0;
    // compute position of each events until we got the event that is just before

    let lastBar = 1;
    let lastBeat = 1;

    let barDuration = null;
    let barSignature = null;
    let tempoBpm = null;
    let tempoBasis = null;

    let nextBarDuration = null;
    let nextBarSignature = null;
    let nextTempoBpm = null;
    let nextTempoBasis = null;

    for (let i = 0; i < this.score.length; i++) {
      const event = this.score[i];

      switch (event.type) {
        case 'BAR': {
          if (event.signature) {
            nextBarDuration = null;
            nextBarSignature = event.signature;
          } else if (event.duration) {
            nextBarSignature = null;
            nextBarDuration = event.duration;
          }
          break;
        }
        case 'TEMPO': {
          nextTempoBpm = event.bpm;

          if (event.basis) {
            nextTempoBasis = event.basis
          }
          break;
        }
        case 'LABEL':
        case 'FERMATA': {
          // do nothing:
          // - labels don't carry timing informations
          // - fermata are kind of deformations of the timeline
          break;
        }
      }

      if (barDuration !== null
        || (barSignature !== null
          && tempoBpm !== null
          && tempoBasis !== null
        )
      ) {
        const delta = this._computeDurationFromPosition(
          lastBar,
          lastBeat,
          event.bar,
          event.beat,
          barSignature,
          tempoBpm,
          tempoBasis,
        );

        if (position + delta > targetPosition) {
          break;
        }

        position += delta;
      }

      barDuration = nextBarDuration;
      barSignature = nextBarSignature;
      tempoBpm = nextTempoBpm;
      tempoBasis = nextTempoBasis;
      lastBar = event.bar;
      lastBeat = event.beat;
    }

    // position is right on the
    if (position === targetPosition) {
      return { bar: lastBar, beat: lastBeat };
    } else {
      // we must compute the location from the last event
      const delta = targetPosition - position;
      const basisDuration = 60 / tempoBpm;
      const numBasis = delta / basisDuration;

      const numBasisInBar = (barSignature.upper / barSignature.lower) /
        (tempoBasis.upper / tempoBasis.lower);

      const numBarNormalized = numBasis / numBasisInBar;

      const numBeatsFull = numBarNormalized * barSignature.upper;
      const numBars = Math.floor(numBeatsFull / barSignature.upper);
      const numBeats = numBeatsFull % barSignature.upper;

      let bar = lastBar + numBars;
      let beat = lastBeat + numBeats;

      if (beat > barSignature.upper) {
        bar += 1;
        beat -= barSignature.upper;
      }

      return { bar, beat };
    }
  }

  // return a timeline position accroding to a given bar and beat
  // fermata are ignored in this computation
  getPositionAtLocation(bar, beat = 1) {
    if (bar < 1) {
      throw new Error('Invalid bar number, cannot be below 1');
    }

    if (beat < 1) {
      throw new Error('Invalid beat number, cannot be below 1');
    }

    let position = 0;

    let lastBar = 1;
    let lastBeat = 1;

    let barDuration = null;
    let barSignature = null;
    let tempoBpm = null;
    let tempoBasis = null;

    for (let i = 0; i < this.score.length; i++) {
      let event = this.score[i];

      // we have all information to compute the position
      if (event.bar > bar || (event.bar === bar && event.beat >= beat)) {
        // we want to fully parse the first beat in any case
        if (event.bar === 1 && event.beat === 1) {
          continue;
        } else {
          break;
        }
      }

      if (barDuration !== null
        || (barSignature !== null
          && tempoBpm !== null
          && tempoBasis !== null
        )
      ) {
        const delta = this._computeDurationFromPosition(
          lastBar,
          lastBeat,
          event.bar,
          event.beat,
          barSignature,
          tempoBpm,
          tempoBasis,
        );

        position += delta;
      }

      switch (event.type) {
        case 'BAR': {
          if (event.signature) {
            barDuration = null;
            barSignature = event.signature;
          } else if (event.duration) {
            barSignature = null;
            barDuration = event.duration;
          }
          break;
        }
        case 'TEMPO': {
          tempoBpm = event.bpm;

          if (event.basis) {
            tempoBasis = event.basis
          }
          break;
        }
        case 'LABEL':
        case 'FERMATA': {
          // do nothing:
          // - labels don't carry timing informations
          // - fermata are kind of deformations of the timeline
          break;
        }
      }

      lastBar = event.bar;
      lastBeat = event.beat;
    }

    const delta = this._computeDurationFromPosition(
      lastBar,
      lastBeat,
      bar,
      beat,
      barSignature,
      tempoBpm,
      tempoBasis,
    );

    position += delta;

    return position;
  }
}

export default SoapScoreInterpreter;
