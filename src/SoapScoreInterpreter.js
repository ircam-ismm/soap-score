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

  // return bar and beat just before the given position
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
        let nextBar = next.bar;
        let nextBeat = next.beat;

        const delta = this._computeDurationFromEventToPosition(event, nextBar, nextBeat);

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
        let nextBar = next.bar;
        let nextBeat = next.beat;

        // next event is at same position or after the given limit,
        // keep event as last interesting event and jump to the end of the function
        if (nextBar > bar || (nextBar === bar && nextBeat >= beat)) {
          break;
        }

        const delta = this._computeDurationFromEventToPosition(event, nextBar, nextBeat);
        position += delta;
      }
    }

    // compute from last event until given location
    const delta = this._computeDurationFromEventToPosition(event, bar, beat);
    position += delta;

    return position;
  }
}

export default SoapScoreInterpreter;
