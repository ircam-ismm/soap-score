import { parseScore } from './soap-score-parser.js';
import memoizeLast from './utils/memoize-last.js';

export default class SoapScoreInterpreter {
  constructor(score) {
    this.score = parseScore(score);

    this.getLocationAtLabel = memoizeLast(this.getLocationAtLabel.bind(this));
    this.getPositionAtLabel = memoizeLast(this.getPositionAtLabel.bind(this));
    this.getPositionAtLocation = memoizeLast(this.getPositionAtLocation.bind(this));
    this.getLocationAtPosition = memoizeLast(this.getLocationAtPosition.bind(this));
    this.getLocationInfos = memoizeLast(this.getLocationInfos.bind(this));
    this.getNextLocationInfos = memoizeLast(this.getNextLocationInfos.bind(this));
  }

  /**
   * Return the list of all labels
   */
  getLabels() {
    return this.score.filter(e => e.label !== null).map(e => e.label);
  }

  /**
   * Return the location of the given label
   */
  getLocationAtLabel(label) {
    const event = this.score.find(event => event.label === label);

    if (event) {
      return { bar: event.bar, beat: event.beat };
    } else {
      return null;
    }
  }

  /**
   * Return the position of the given label
   */
  getPositionAtLabel(label) {
    const event = this.score.find(event => event.label === label);

    if (event !== null) {
      return this.getPositionAtLocation(event.bar, event.beat);
    } else {
      return 0;
    }
  }

  /**
   * Returns the position (in seconds) in the score according to given bar|beat location.
   * Note that the returned position ignores fermatas.
   */
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

        const delta = this._getDurationFromEventToLocation(event, next.bar, next.beat);
        position += delta;
      }
    }

    // compute from last event until given location
    const delta = this._getDurationFromEventToLocation(event, bar, beat);
    position += delta;

    return position;
  }

  /**
   * Return the (bar|beat) pair that correspond to the given position
   */
  getLocationAtPosition(targetPosition) {
    if (targetPosition < 0) {
      throw new Error('Invalid target position, cannot be negative');
    }

    let position = 0;
    // compute position of each events until we got the event that is just
    // before targetPosition
    let event = null;

    // @note: we could avoid this by computing and memoizing locations of events
    for (let i = 0; i < this.score.length; i++) {
      event = this.score[i];

      if (this.score[i + 1]) {
        const next = this.score[i + 1];
        const delta = this._getDurationFromEventToLocation(event, next.bar, next.beat);

        if (position + delta >= targetPosition) {
          break;
        } else {
          position += delta;
        }
      }
    }

    // position is right on the target position, consider floating point errors
    if (Math.abs(targetPosition - position) < 1e-3) {
      return { bar: event.bar, beat: event.beat };
    // bars are defined by absolute duration, just find the closest bar
    } else if (event.duration) {
      const delta = targetPosition - position;
      const norm = delta / event.duration;
      const numFullBars = Math.floor(norm);

      const bar = event.bar + numFullBars;
      let beat = 1 + (norm % 1);

      // mitigate potential floating point errors, e.g. score
      // > BAR 1 [4/4] TEMPO [1/4]=90
      // > BAR 2 2s
      // > BAR 3 [4/4] TEMPO [1/4]=90
      // > BAR 4 2s
      // crashes at bar 5
      if (Math.abs(Math.round(beat) - beat) < 1e-3) {
        beat = Math.round(beat);
      }

      return { bar, beat };
    } else {
      // just brute force things with _getBeatDuration as it will magically handle
      // irregular (and additive) signature as well as on going curves
      let { bar, beat } = event;

      while (position < targetPosition) {
        const duration = this._getBeatDuration(event, bar, beat);
        // if zero we want to return the next full position, so we wait
        // but handle fractionnal beats here
        //
        // we add an offset to target position to avoid weird floating point error cases
        if (position + duration > (targetPosition + 1e-3)) {
          const ratio = (targetPosition - position) / duration;
          beat += ratio;
          break;
        }

        position += duration;

        const next = this._getNextLocation(event, bar, beat);
        bar = next.bar;
        beat = next.beat;

        if (Math.abs(targetPosition - position) < 1e-3) {
          break;
        }
      }

      if (Math.abs(Math.round(beat) - beat) < 1e-3) {
        beat = Math.round(beat);
      }

      return { bar, beat };
    }
  }

  /**
   * Return infos about the given (bar|beat) location
   */
  getLocationInfos(bar, beat) {
    const event = this._getEventAtLocation(bar, beat);
    const position = this.getPositionAtLocation(bar, beat);

    const unit = {};

    if (event.duration != null) {
      // @note - maybe enforce that in parsing
      unit.upper = 1;
      unit.lower = 1;
    } else {
      if (Math.floor(beat - 1) >= event.units.numBeats) {
        // maybe be nicer... tbd
        throw Error(`beat ${beat} for bar ${bar} does not exists`);
      }

      unit.upper = event.units.upper[Math.floor(beat) - 1];
      unit.lower = event.units.lower;
    }

    // duration until next full beat
    let duration = this._getBeatDuration(event, bar, beat);
    // if no fermta and no event until next beat, dt is equal to duration
    let dt = duration;
    // handle all other case
    const next = this._getNextLocation(event, bar, beat);

    let inBetweenEvent = null;

    if (next !== null) {
      inBetweenEvent = this._hasEventBetweenLocations(bar, beat, next.bar, next.beat);
    }

    // `dt` is the time until next event whatever it is (inbetween event, etc)
    if (event.fermata) {
      // in fermata
      // - duration is the duration of fermata basis accroding to current tempo
      // - dt is the delta to next event according to relDuration, absDuration, etc.
      const fermataBasis = event.fermata.basis;
      const tempoBasis = event.tempo.basis;
      const bpm = event.tempo.bpm;
      const basisDuration = 60 / bpm;

      const numBasisInFermataBasis = (fermataBasis.upper / fermataBasis.lower) /
         (tempoBasis.upper / tempoBasis.lower);

      duration = numBasisInFermataBasis * basisDuration;

      if (event.fermata.absDuration) {
        dt = event.fermata.absDuration;
      } else if (event.fermata.relDuration) {
        dt = duration * event.fermata.relDuration;
      } else if (event.fermata.suspended) {
        dt = +Infinity;
      }
    } else if (inBetweenEvent !== null) {
      // compute dt between this beat and next event
      const ratio = inBetweenEvent.beat - beat;
      dt *= ratio;
    }

    return { bar, beat, unit, position, duration, dt, event };
  }

  /**
   * Return infos about the next (bar|beat) location, i.e. this will be the next
   * beat, but could also be informations related to an event located between 2 beats
   */
  getNextLocationInfos(bar, beat) {
    const event = this._getEventAtLocation(bar, beat);

    if (event.fermata !== null) {
      // we skip all beats until next event, note that the event at the end of
      // the fermata is automatically inserted by the parser
      const index = this.score.indexOf(event);
      const next = this.score[index + 1];

      return this.getLocationInfos(next.bar, next.beat);
    }

    let next = this._getNextLocation(event, bar, beat);

    if (next === null) {
      return null;
    }

    // check if we have an event between the two locations
    const inBetweenEvent = this._hasEventBetweenLocations(bar, beat, next.bar, next.beat);

    if (inBetweenEvent !== null) {
      next.bar = inBetweenEvent.bar;
      next.beat = inBetweenEvent.beat;
    }

    return this.getLocationInfos(next.bar, next.beat);
  }

  /**
   * Return the normalized position inside a bar
   */
  _normalizeBeat(event, beat) {
    let normBeat;
    let numBeats = 0;

    for (let i = 1; i < Math.floor(beat); i++) {
      const localUpper = event.units.upper[i - 1];
      numBeats += localUpper;
    }

    // handle floating point beats
    if (Math.floor(beat) !== beat) {
      const localUpper = event.units.upper[Math.floor(beat) - 1];
      numBeats += localUpper * (beat % 1);
    }

    normBeat = numBeats / event.signature.upper;

    return normBeat;
  }

  /**
   * Return the duration of a beat, with curve applied. If beat is a floating
   * point value, duration is the time until the next full beat
   */
  _getBeatDuration(event, bar, beat) {
    const beatRemaining = 1 - (beat % 1);
    beat = Math.floor(beat);

    if (event.duration) {
      // there is no possible tempo curve in absolute duration events
      return event.duration * beatRemaining;
    }

    // compute bpm according to eventual curve
    const bpm = event.tempo.curve
      ? this._getBpmInCurve(event.tempo.curve, bar, beat)
      : event.tempo.bpm

    const tempoBasisDuration = 60 / bpm;
    const tempoBasisUpper = event.tempo.basis.upper;
    const tempoBasisLower = event.tempo.basis.lower;

    const unitUpper = event.units.upper[beat - 1];
    const unitLower = event.units.lower;

    const ratio = (unitUpper / unitLower) / (tempoBasisUpper / tempoBasisLower);

    return tempoBasisDuration * ratio * beatRemaining;
  }

  /**
   * Return the duration of a bar, without curves applied
   */
  _getBarDuration(event) {
    const beatDuration = 60 / event.tempo.bpm;
    const numBeatsNormToBasis = (event.signature.upper / event.signature.lower)
      / (event.tempo.basis.upper / event.tempo.basis.lower);

    return numBeatsNormToBasis * beatDuration;
  }

  /**
   * Return the location, with integer beat, that is just after the given one
   */
  _getNextLocation(event, bar, beat) {
    // handle absolute duration cases, next location is just the next bar
    if (event.duration) {
      if (event.end) {
        return null;
      }

      return { bar: bar + 1, beat: 1 };
    } else {
      beat = Math.floor(beat) + 1;

      if (beat > event.units.numBeats) {
        // end of score, there is no next bar
        if (event.end === true) {
          return null;
        }

        bar += 1;
        beat = 1;
      }

      return { bar, beat };
    }
  }

  /**
   * Return the event just before given bar and beat
   */
  _getEventAtLocation(bar, beat) {
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

  /**
   * Returns the greatest location
   */
  _max(bar1, beat1, bar2, beat2) {
    if (bar1 > bar2) {
      return { bar: bar1, beat: beat1 };
    } else if (bar1 < bar2) {
      return { bar: bar2, beat: beat2 };
    } else {
      return { bar: bar1, beat: Math.max(beat1, beat2) };
    }
  }

  /**
   * Returns the lowest location
   */
  _min(bar1, beat1, bar2, beat2) {
    if (bar1 > bar2) {
      return { bar: bar2, beat: beat2 };
    } else if (bar1 < bar2) {
      return { bar: bar1, beat: beat1 };
    } else {
      return { bar: bar1, beat: Math.min(beat1, beat2) };
    }
  }

  /**
   * Return the normalized number of bars between the (bar|beat) pairs
   */
  _getNumBarWithinEvent(event, startBar, startBeat, endBar, endBeat) {
    const numBarNormalized = (endBar - (startBar + 1)) // number of full bars
        + 1 - this._normalizeBeat(event, startBeat) // duration from event beat to next bar
        + this._normalizeBeat(event, endBeat); // duration from bar start to beat

    return numBarNormalized;
  }

  /**
   * Return the number of bars (+ 1 beat) in the given interval expressed in the
   * bar unit of the start event.
   * The +1 beat is here because we want the first beat of the curve to be already
   * faster. As such, then we offset the returned value (in bars) by one (phantom)
   * "beat" (of length of the first beat in the interval) so that the curves logically
   * starts before it's defined start beat.
   */
  _getNumBarAccrosEvents(startBar, startBeat, endBar, endBeat) {
    let numUnits = 0;

    const eventAtStart = this._getEventAtLocation(startBar, startBeat);
    const barDuration = this._getBarDuration(eventAtStart);
    const startIndex = this.score.indexOf(eventAtStart);

    // add 1 "phantom" beat
    const next = this._getNextLocation(eventAtStart, startBar, startBeat);
    const offsetNormalized = this._getNumBarWithinEvent(
      eventAtStart,
      startBar,
      startBeat,
      next.bar,
      next.beat,
    );

    numUnits += offsetNormalized;

    for (let i = startIndex; i < this.score.length; i++) {
      let event = this.score[i];

      // end curve event, we just just check for equality, we know a end event
      // always exists in curves
      if (event.bar > endBar || (event.bar === endBar && event.beat >= endBeat)) {
        break;
      }

      // we want to find the number of tempo unit (of start event) in the curve
      // this may be floating point value, if the curve contains signature changes
      // and tempo equivalencies
      const position = this._max(event.bar, event.beat, startBar, startBeat);
      const prevBar = position.bar;
      const prevBeat = position.beat;
      // num basis between this event and next event
      // no need to do more checks, a curve must have an end...
      const nextEvent = this.score[i + 1];

      let nextBar;
      let nextBeat;

      if (nextEvent) {
        const position = this._min(endBar, endBeat, nextEvent.bar, nextEvent.beat);
        nextBar = position.bar;
        nextBeat = position.beat;
      } else {
        nextBar = endBar;
        nextBeat = endBeat;
      }

      const localBarDuration = this._getBarDuration(event);
      const numBarNormalized = this._getNumBarWithinEvent(
        event,
        prevBar,
        prevBeat,
        nextBar,
        nextBeat,
      );

      const durationRatio = localBarDuration / barDuration;

      numUnits += (numBarNormalized * durationRatio);
    }

    return numUnits;
  }

  /**
   * Compute the bpm of the given beat within the curve,
   * Note that the returned value does not take into account the basis of the tempo,
   * it is a mre interpolation between the 2 bpm values. The value of the basis
   * to calculale the duration of e.g. a beat, must be taken into account later.
   *
   * The curve is applied on the given bar / beat as if the curve was starting at beat
   * before it is defined, this may appear counterintuitive but is musicaly more
   * pertinant.
   */
  _getBpmInCurve(curve, bar, beat) {
    const { start, end, exponent } = curve;
    // this is expressed in bar unit
    const curveLength = this._getNumBarAccrosEvents(start.bar, start.beat, end.bar, end.beat);
    const positionInCurve = this._getNumBarAccrosEvents(start.bar, start.beat, bar, beat);
    const normPositionInCurve = positionInCurve / curveLength;
    const bpm = start.bpm + (end.bpm - start.bpm) * Math.pow(normPositionInCurve, exponent);

    return bpm;
  }

  /**
   * Compute duration from the beignning of an event to the given (bar, beat)
   * bar|beat MUST be inside the event
   */
  _getDurationFromEventToLocation(event, targetBar, targetBeat) {
    // handle absolute duration
    if (event.duration) {
      // target beat should be between [1, 2[
      const { duration, bar } = event;
      const numBar = targetBar - bar;

      return duration * numBar + Math.min(targetBeat - 1, 1) * duration;
    }

    // most common behavior
    if (event.tempo.curve === null) {
      // duration of a tempo basis
      const basisDuration = 60 / event.tempo.bpm;
      const numBasisInBar = (event.signature.upper / event.signature.lower)
        / (event.tempo.basis.upper / event.tempo.basis.lower);

      const numBarNormalized = this._getNumBarWithinEvent(
        event,
        event.bar,
        event.beat,
        targetBar,
        targetBeat
      );

      return numBarNormalized * numBasisInBar * basisDuration;
    } else {
      const upper = event.units.upper[Math.floor(targetBeat) -1];
      const lower = event.units.lower;
      // compute each beat one after the other
      const curve = event.tempo.curve;
      let { bar, beat } = event;
      let duration = 0;

      while (bar < targetBar || (bar === targetBar && beat < targetBeat)) {
        // handle bpm as well as irregular and additive signatures
        let beatDuration = this._getBeatDuration(event, bar, beat);
        // last beat and target beat is a floating point value
        if (bar === targetBar && targetBeat - beat < 1) {
          beatDuration *= (targetBeat % 1);
        }

        duration += beatDuration;

        const next = this._getNextLocation(event, bar, beat);
        bar = next.bar;
        beat = next.beat;
      }

      return duration;
    }
  }

  /**
   * Return the first event found between the two locations, if no event is
   * found, return null
   */
  _hasEventBetweenLocations(preBar, preBeat, postBar, postBeat) {
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
}
