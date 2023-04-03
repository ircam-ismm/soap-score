import { parseScore } from './soap-score-parser.js';

class SoapScoreInterpreter {
  constructor(score) {
    this.score = parseScore(score);
    // should never change at this point
    this._labels = this.score.filter(e => e.type === 'LABEL').map(e => e.label);
  }

  _computeDurationFromEventToPosition(event, nextBar, nextBeat) {
    const basisDuration = 60 / event.tempo.bpm;

    // bar with absolute duration
    if (event.duration) {
      return event.duration;
    }

    const numBasisInBar = (event.signature.upper / event.signature.lower) /
      (event.tempo.basis.upper / event.tempo.basis.lower);

    const barDuration = numBasisInBar * basisDuration;

    const numBarNormalized = (nextBar - (event.bar + 1))
      + (1 - (event.beat - 1) / event.signature.upper)
      + ((nextBeat - 1) / event.signature.upper);

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

  // return bar and beat at just before the given position, if target position
  // is between 2 beats, beat will be a floating point value
  getLocationAtPosition(targetPosition) {
    if (targetPosition < 0) {
      throw new Error('Invalid target position, cannot be negative');
    }

    let position = 0;
    // compute position of each events until we got the event that is just
    // before targetPosition
    let event = null;

    for (let i = 0; i < this.score.length; i++) {
      event = this.score[i];

      if (this.score[i + 1]) {
        let next = this.score[i + 1];
        const delta = this._computeDurationFromEventToPosition(event, next.bar, next.beat);

        if (position + delta >= targetPosition) {
          break;
        } else {
          position += delta;
        }
      }
    }

    // position is right on the
    if (position === targetPosition) {
      return { bar: event.bar, beat: event.beat };
    } else {
      // we must compute the location from the last event
      const delta = targetPosition - position;
      const basisDuration = 60 / event.tempo.bpm;
      const numBasis = delta / basisDuration;

      const numBasisInBar = (event.signature.upper / event.signature.lower) /
        (event.tempo.basis.upper / event.tempo.basis.lower);

      const numBarNormalized = numBasis / numBasisInBar;

      const numBeatsFull = numBarNormalized * event.signature.upper;
      const numBars = Math.floor(numBeatsFull / event.signature.upper);
      const numBeats = numBeatsFull % event.signature.upper;

      let bar = event.bar + numBars;
      let beat = event.beat + numBeats;

      if (beat > event.signature.upper) {
        bar += 1;
        beat -= event.signature.upper;
      }

      return { bar, beat };
    }
  }

  // return a timeline position according to a given bar and beat
  // fermata are ignored in this computation
  getPositionAtLocation(bar, beat = 1) {
    if (bar < 1) {
      throw new Error('Invalid bar number, cannot be below 1');
    }

    if (beat < 1) {
      throw new Error('Invalid beat number, cannot be below 1');
    }

    let position = 0;
    let event = null;

    for (let i = 0; i < this.score.length; i++) {
      event = this.score[i];

      if (this.score[i + 1]) {
        let next = this.score[i + 1];

        // if next event is at same position or after the given limit,
        // we keep previous event as last interesting event and jump to the end of the function
        if (next.bar > bar || (next.bar === bar && next.beat >= beat)) {
          break;
        }

        const delta = this._computeDurationFromEventToPosition(event, next.bar, next.beat);
        position += delta;
      }
    }

    // compute from last event until given location
    const delta = this._computeDurationFromEventToPosition(event, bar, beat);
    position += delta;

    return position;
  }

  getLocationInfos(bar, beat) {
    const event = this.getEventAtLocation(bar, beat);
    const position = this.getPositionAtLocation(bar, beat);

    // @todo - handle composed signatures
    const basis = event.tempo.basis;
    const duration = 60 / event.tempo.bpm;

    return { bar, beat, event, position, basis, durations };
  }

  getNextLocationInfos(bar, beat) {
    const currentEvent = this.getEventAtLocation(bar, beat);

    const currentBasis = currentEvent.tempo.basis;
    const currentSignature = currentEvent.signature;
    // define number of beat basis in the coordinates of the bar signature
    // const sigBeats = (basis.upper / basis.lower) / (1 / signature.lower);

    // if given beat is a float, we just want the next integer beat
    beat = Math.floor(beat + 1);

    // express beats in signature coordinates
    const sigBeats = (beat - 1) * (currentBasis.upper / currentBasis.lower) / (1 / currentSignature.lower);

    // @todo - do not assume input bar and beat are consistent (e.g. 1, 5 in a [4/4] mesures)
    if (sigBeats >= currentEvent.signature.upper) {
      bar += 1;
      beat = 1;
    }

    const event = this.getEventAtLocation(bar, beat);
    const position = this.getPositionAtLocation(bar, beat);

    // @todo - handle composed signatures
    const basis = event.tempo.basis;
    const duration = 60 / event.tempo.bpm;

    return { bar, beat, event, position, basis, duration };
  }

  // get score event just before given bar and beat
  getEventAtLocation(bar, beat = 1) {
    let event = null;

    for (let i = 0; i < this.score.length; i++) {
      event = this.score[i];

      if (this.score[i + 1]) {
        let next = this.score[i + 1];

        // break only if event is strictly after given location
        if (next.bar > bar || (next.bar === bar && next.beat > beat)) {
          break;
        }
      }
    }

    return event;
  }
}

export default SoapScoreInterpreter;
