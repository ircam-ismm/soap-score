import { parseScore } from './soap-score-parser.js';
import TimeSignature from '@tonaljs/time-signature';

class SoapScoreInterpreter {
  constructor(score) {
    this.score = parseScore(score);
    // should never change at this point
    this._labels = this.score.filter(e => e.type === 'LABEL').map(e => e.label);
  }

  _computeDurationFromEventToPosition(event, nextBar, nextBeat) {
    // bar with absolute duration
    if (event.duration) {
      return event.duration;
    }

    const basisDuration = 60 / event.tempo.bpm;

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

    // position is right on the target position,
    if (position === targetPosition) {
      return { bar: event.bar, beat: event.beat };
    // bars are defined by absolute duration, just find the closest bar
    } else if (event.duration) {
      const delta = targetPosition - position;
      const numFullBars = Math.floor(delta / event.duration);
      return { bar: event.bar + numFullBars, beat: 1 };
    }
    // we must compute the location from the last event
    else {
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
    // ignore absolute duration event (@todo tbc)
    if (event.duration === null) {
      const delta = this._computeDurationFromEventToPosition(event, bar, beat);
      position += delta;
    }

    return position;
  }

  getLocationInfos(bar, beat) {
    const event = this.getEventAtLocation(bar, beat);

    // if event has an obsolute duration, beat can only be '1'
    if (event.duration) {
      beat = 1;
      const position = this.getPositionAtLocation(bar, beat);
      const basis = TimeSignature.get('1/1');
      const duration = event.duration;

      return { bar, beat, event, position, basis, duration };
    }

    const position = this.getPositionAtLocation(bar, beat);

    let { basis, bpm }  = event.tempo;
    const signature = event.signature;
    const basisDuration = 60 / event.tempo.bpm;

    let duration;
    // complex/irregular measures, e.g. BAR 1 [3+2+2/8] TEMPO [3/8]=60
    if (signature.additive.length > 0) {
      const localBasis = TimeSignature.get([signature.additive[beat - 1], signature.lower]);
      const basisRatio = (localBasis.upper / localBasis.lower) / (basis.upper / basis.lower);

      duration = basisRatio * basisDuration;
      basis = localBasis;

    // general case, also handle cases when signture is not a integer mutliple of
    // tempo basis: e.g. BAR 1 [5/8] TEMPO [1/4]=60 -> 1, 1, 0.5
    } else {
      // normalized bar according to basis unit
      const normBar = (signature.upper / signature.lower) / (basis.upper / basis.lower);
      // beat duration according to basis unit
      const normBeatDuration = Math.min(normBar - (beat - 1), 1);

      duration = basisDuration * normBeatDuration;
      // let's just hope this stays rationnal
      // normBeatDuration should be between 0 and 1
      if (normBeatDuration !== 1) {
        basis = TimeSignature.get([basis.upper, basis.lower / normBeatDuration]);
      }
    }

    // if there is an event within the next beat, we want to adapt the duration
    const { nextBar, nextBeat } = this.getNextLocation(bar, beat);
    const inBetweenEvent = this.hasEventBetweenLocations(bar, beat, nextBar, nextBeat);

    if (inBetweenEvent !== null) {
      const ratio = inBetweenEvent.beat - beat;
      duration *= ratio;
    }

    return { bar, beat, event, position, basis, duration };
  }

  // @todo - do not assume input input beat is consistent (e.g. beat 5 in a [4/4] mesures)
  // or thow error
  getNextLocationInfos(bar, beat) {
    let { nextBar, nextBeat } = this.getNextLocation(bar, beat);

    // check if we have an event between the two locations
    const inBetweenEvent = this.hasEventBetweenLocations(bar, beat, nextBar, nextBeat);

    if (inBetweenEvent !== null) {
      nextBar = inBetweenEvent.bar;
      nextBeat = inBetweenEvent.beat;
    }

    const values = this.getLocationInfos(nextBar, nextBeat);

    // we need to adapt duration
    if (inBetweenEvent !== null) {
      const remaining = 1 - (values.beat % 1);
      values.duration *= remaining;
    }

    return values;
  }

  getNextLocation(bar, beat) {
    const currentEvent = this.getEventAtLocation(bar, beat);

    let nextBar;
    let nextBeat;

    // when event has an absolute duration, beat can only be one
    if (currentEvent.duration) {
      if (beat !== 1) {
        throw new Error(`Invalid beat, bar is defined with absolute duration so it has only 1 beat`);
      }

      nextBar = bar + 1;
      nextBeat = 1;

    } else {
      // no absolute duration
      const currentBasis = currentEvent.tempo.basis;
      const currentSignature = currentEvent.signature;
      // if given beat is a float, we just want the next integer beat
      nextBar = bar;
      nextBeat = Math.floor(beat + 1);

      // handle additive signature
      if (currentSignature.additive.length > 0) {
        if (beat > currentSignature.additive.length) {
          nextBar = bar + 1;
          nextBeat = 1;
        }
      // general case, also handle cases when signture is not a integer multiple of
      // tempo basis: e.g. BAR 1 [5/8] TEMPO [1/4]=60 -> 1, 1, 0.5
      } else {
        // express beats in signature coordinates
        const sigBeat = (nextBeat - 1) * (currentBasis.upper / currentBasis.lower)
          / (1 / currentSignature.lower);

        if (sigBeat >= currentEvent.signature.upper) {
          nextBar = bar + 1;
          nextBeat = 1;
        }
      }
    }

    return { nextBar, nextBeat };
  }

  // return the first found event between two locations (excluded, ]pre, post[)
  // returns null otherwise
  hasEventBetweenLocations(preBar, preBeat, postBar, postBeat) {
    for (let i = 0; i < this.score.length; i++) {
      const event = this.score[i];
      const { bar, beat } = event;

      if (bar >= preBar && beat > preBeat && bar <= postBar && beat < postBeat) {
        return event;
      }
    }

    return null;
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
