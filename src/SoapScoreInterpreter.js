import { parseScore } from './soap-score-parser.js';
import TimeSignature from '@tonaljs/time-signature';

class SoapScoreInterpreter {
  constructor(score) {
    this.score = parseScore(score);
    // should never change at this point
    this._labels = this.score.filter(e => e.label !== null).map(e => e.label);
  }

  _computeDurationFromEventToPosition(event, targetBar, targetBeat) {
    // bar with absolute duration
    if (event.duration) {
      return event.duration;
    }

    if (event.fermata) {
      if (event.fermata.absDuration) {}
    }

    if (event.tempo.curve === null) {
      const basisDuration = 60 / event.tempo.bpm;

      const numBasisInBar = (event.signature.upper / event.signature.lower) /
        (event.tempo.basis.upper / event.tempo.basis.lower);

      const barDuration = numBasisInBar * basisDuration;

      const numBarNormalized = (targetBar - (event.bar + 1))
        + (1 - (event.beat - 1) / event.signature.upper)
        + ((targetBeat - 1) / event.signature.upper);

      return numBarNormalized * barDuration;
    } else {
      // compute each beat one after the other
      const curve = event.tempo.curve;
      let { bar, beat } = event;
      // @todo (maybe) handle events in between beats
      let duration = 0;

      while (bar < targetBar || (bar === targetBar && beat < targetBeat)) {
        const bpm = this.computeBpmInCurve(curve, bar, beat);
        let beatDuration = 60 / bpm;

        // last beat and target beat is a floating point value
        if (bar === targetBar && targetBeat - beat < 1) {
          beatDuration *= (targetBeat % 1);
        }

        duration += beatDuration;

        const location = this.getNextLocation(bar, beat);
        bar = location.nextBar;
        beat = location.nextBeat;
      }

      return duration;
    }
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

  getPositionAtLabel(label) {
    const event = this.getLocationAtLabel(label);

    if (event !== null) {
      return this.getPositionAtLocation(event.bar, event.beat);
    } else {
      return 0;
    }
  }

  // return bar and beat at just before the given position, if target position
  // is between 2 beats, beat will be a floating point value
  //
  // @todo handle curve
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

    } else {
      // we must compute the location from the last event
      if (event.tempo.curve === null) {
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
      } else {
        // unroll curve until we are at the right location
        let delta = targetPosition - position;
        const curve = event.tempo.curve;
        let { bar, beat } = event;

        while (delta > 0) {
          const bpm = this.computeBpmInCurve(curve, bar, beat);
          const beatDuration = 60 / bpm;

          if (beatDuration <= delta) {
            delta -= beatDuration;

            const location = this.getNextLocation(bar, beat);
            bar = location.nextBar;
            beat = location.nextBeat;
          } else {
            const ratio = delta / beatDuration;
            beat += ratio;
            delta = 0;
          }
        }

        return { bar, beat };
      }
    }
  }

  // return a timeline position according to a given bar and beat
  // fermata are ignored in this computation
  //
  // @todo handle curve
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
      const dt = event.duration;

      return { bar, beat, basis, duration, dt, event, position };
    }

    const position = this.getPositionAtLocation(bar, beat);

    let { basis, bpm }  = event.tempo;
    // adjust bpm if we are in the middle of a curve
    if (event.tempo.curve !== null) {
      bpm = this.computeBpmInCurve(event.tempo.curve, bar, beat);
    }

    const { signature } = event;
    const basisDuration = 60 / bpm;

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

    let dt = duration;

    if (inBetweenEvent !== null) {
      const ratio = inBetweenEvent.beat - beat;
      dt *= ratio;
    }

    return { bar, beat, basis, duration, dt, event, position };
  }

  // @todo - do not assume input input beat is consistent (e.g. beat 5 in a [4/4] mesures)
  // or thow error
  getNextLocationInfos(bar, beat) {
    let { nextBar, nextBeat } = this.getNextLocation(bar, beat);

    // check if we have an event between the two locations
    const inBetweenEvent = this.hasEventBetweenLocations(bar, beat, nextBar, nextBeat);

    console.log('inBetweenEvent', inBetweenEvent, bar, beat, nextBar, nextBeat)
    if (inBetweenEvent !== null) {
      nextBar = inBetweenEvent.bar;
      nextBeat = inBetweenEvent.beat;
    }

    const values = this.getLocationInfos(nextBar, nextBeat);

    // we need to adapt duration
    if (inBetweenEvent !== null) {
      const remaining = 1 - (values.beat % 1);
      // this is not a full beat event so we override duration too
      values.duration *= remaining;
      values.dt *= remaining;
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
        if (nextBeat > currentSignature.additive.length) {
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

  max(bar1, beat1, bar2, beat2) {
    if (bar1 > bar2) {
      return { bar: bar1, beat: beat1 };
    } else if (bar1 < bar2) {
      return { bar: bar2, beat: beat2 };
    } else {
      return { bar: bar1, beat: Math.max(beat1, beat2) };
    }
  }

  min(bar1, beat1, bar2, beat2) {
    if (bar1 > bar2) {
      return { bar: bar2, beat: beat2 };
    } else if (bar1 < bar2) {
      return { bar: bar1, beat: beat1 };
    } else {
      return { bar: bar1, beat: Math.min(beat1, beat2) };
    }
  }

  // number of unit in an interval expressed in unit of the start point
  // this is used to compute
  getNumUnitsInInterval(startBar, startBeat, endBar, endBeat) {
    let numUnits = 0;

    const eventAtStart = this.getEventAtLocation(startBar, startBeat);
    const unitDuration = 60 / eventAtStart.tempo.bpm;
    const startIndex = this.score.indexOf(eventAtStart);

    for (let i = startIndex; i < this.score.length; i++) {
      let event = this.score[i];

      // end curve event, just check for equality, we know it exists
      if (event.bar > endBar || (event.bar === endBar && event.beat >= endBeat)) {
        break;
      }

      // we want to find the number of tempo unit (of start event) in the curve
      // this may be floating point value, if the curve contains signature changes
      // and tempo equivalencies
      const position = this.max(event.bar, event.beat, startBar, startBeat);
      const prevBar = position.bar;
      const prevBeat = position.beat;
      // num basis between this event and next event
      // no need to do more checks, a curve must have an end...
      const nextEvent = this.score[i + 1];

      let nextBar;
      let nextBeat;

      if (nextEvent) {
        const position = this.min(endBar, endBeat, nextEvent.bar, nextEvent.beat);
        nextBar = position.bar;
        nextBeat = position.beat;
      } else {
        nextBar = endBar;
        nextBeat = endBeat;
      }

      // number of basis in current event coordinates
      const { signature } = event;
      const { basis } = event.tempo;
      const numBasisInBar = (signature.upper / signature.lower) / (basis.upper / basis.lower);
      const numBasisInInterval = (numBasisInBar - (prevBeat - 1))
        + ((nextBar - prevBar - 1) * numBasisInBar)
        + (nextBeat - 1);

      // normalize according to start tempo coordinates
      const basisDuration = 60 / event.tempo.bpm;
      const ratio = basisDuration / unitDuration;

      numUnits += (numBasisInInterval * ratio);
    }

    return numUnits;
  }

  computeBpmInCurve(curve, bar, beat) {
    const { start, end, exponent } = curve;

    const numUnitsInCurve = this.getNumUnitsInInterval(start.bar, start.beat, end.bar, end.beat);
    const positionInCurve = this.getNumUnitsInInterval(start.bar, start.beat, bar, beat);

    // the first event in the curve should already be faster so we add 1 to the normalization
    // @note: do we want this behavior if bar == 1 && beat == 1 ?
    const normPosition = (positionInCurve + 1) / (numUnitsInCurve + 1);
    const bpm = start.bpm + (end.bpm - start.bpm) * Math.pow(normPosition, exponent);

    return bpm;
  }

  // return the first found event between two locations (excluded, ]pre, post[)
  // returns null otherwise
  hasEventBetweenLocations(preBar, preBeat, postBar, postBeat) {
    for (let i = 0; i < this.score.length; i++) {
      const event = this.score[i];
      const { bar, beat } = event;

      if ((bar === preBar && beat > preBeat) || bar > preBar) {
        // is strictly after pre
        if (bar < postBar || (bar === postBar && beat < postBeat)) {
          // is strictly before post
          return event;
        }
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
