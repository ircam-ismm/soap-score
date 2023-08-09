import { parseScore } from './soap-score-parser.js';
import TimeSignature from '@tonaljs/time-signature';

export default class SoapScoreInterpreter {
  constructor(score) {
    this.score = parseScore(score);

    // compute base musical unit from signature and tempo
    this.score.forEach(event => this._computeBarUnit(event));
    this.score.forEach(event => this._computeNumBeats(event));
    this.score.forEach(event => this._harmonizeCurveBPM(event));

    // should never change at this point
    this._labels = this.score.filter(e => e.label !== null).map(e => e.label);
  }

  /**
   * Return the list of all labels
   */
  getLabels() {
    return this._labels;
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
   * Returns the position (in seconds) in the score according to given location
   * (bar|beat).
   *
   * Note that the returned time ignores the defined fermatas.
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
        let next = this.score[i + 1];
        // _getDurationFromEventToLocation takes curves into account
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

      return { bar: event.bar + numFullBars, beat: 1 + (norm % 1) };
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

      return { bar, beat };
    }
  }

  /**
   * Return infos about the given (bar|beat) location
   */
  getLocationInfos(bar, beat) {
    const event = this._getEventAtLocation(bar, beat);
    const position = this.getPositionAtLocation(bar, beat);

    let unit;

    if (event.signature && event.signature.type === 'irregular') {
      let localUpper;

      if (event.signature.additive.length === 0) {
        // only last beat can be lower than unit.upper
        if (beat >= event.numBeats) {
          localUpper = event.signature.upper - event.unit.upper * (Math.floor(beat) - 1);
        } else {
          localUpper = event.unit.upper;
        }
      } else {
        localUpper = event.signature.additive[Math.floor(beat) - 1];
      }

      // adapt bpm to local unit
      const ratio = event.unit.upper / localUpper;
      const bpm = event.unit.bpm * ratio;

      unit = { upper: localUpper, lower: event.unit.lower, bpm };
    } else {
      unit = event.unit;
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
   * Compute logical musical unit and bpm according to defined signature and tempo
   *
   * This is done once for all after score parsing
   *
   * - simple (e.g [4/4], [2/2], [5/4], [5/2]) -> 1 / numerator
   * - compound (e.g. [3/8], [6/8]) -> 3 / numerator
   * - irregular (e.g. [5/8], [7/8] -> 3 / numerator
   */
  _computeBarUnit(event) {
    // if not signature has been given, i.e. absolute duration bars, abort
    if (event.duration) {
      event.unit = { upper: 1, lower: 1, bpm: 60 / event.duration };
    } else {
      let upper;
      let lower;

      if (event.signature.type === 'simple') {
        upper = 1;
        lower = event.signature.lower;
      } else {
        // Attention - Etienne's breaking change - only for tests
        upper = 1;
        lower = event.signature.lower;
      }

      // compute bpm of basis unit according to tempo basis and bpm
      const ratio  = (event.tempo.basis.upper / event.tempo.basis.lower) / (upper / lower);
      const bpm = event.tempo.bpm * ratio;

      event.unit = { upper, lower, bpm };
    }
  }

  /**
   * Compute the number of beats, from a musical point of view, in a bar
   *
   * This is done once for all after score parsing
   *
   * e.g.:
   * - BAR [6/8] has 2 beats
   * - BAR [2+3+1/8] has 3 beats
   */
  _computeNumBeats(event) {
    // if not signature has been given, i.e. absolute duration bars, abort
    if (event.duration) {
      event.numBeats = 1;
    } else {
      let numBeats;

      if (event.signature.type === 'simple' || event.signature.type === 'compound') {
        numBeats = event.signature.upper / event.unit.upper;
      } else {
        if (event.signature.additive.length === 0) {
          // best effort
          numBeats = Math.ceil(event.signature.upper / event.unit.upper);
        } else {
          numBeats = event.signature.additive.length;
        }
      }

      event.numBeats = numBeats;
    }
  }

  /**
   * Replace curve bpm with the ones computed in _computeBarUnit
   *
   * This is done once for all after score parsing.
   */
  _harmonizeCurveBPM(event) {
    if (!event.tempo || !event.tempo.curve) {
      return
    }

    const { start, end } = event.tempo.curve;
    const startEvent = this._getEventAtLocation(start.bar, start.beat);
    const endEvent = this._getEventAtLocation(end.bar, end.beat);

    start.bpm = startEvent.unit.bpm;
    end.bpm = endEvent.unit.bpm;
  }

  /**
   * Return the normalized position inside a bar
   */
  _normalizeBeat(event, beat) {
    let normBeat;

    if (event.signature.type === 'irregular') {

      let numBeats = 0;

      for (let i = 1; i < Math.floor(beat); i++) {
        const localUpper = this._getLocalUpper(event, i);
        numBeats += localUpper;
      }

      // handle floating point beats
      if (Math.floor(beat) !== beat) {
        const localUpper = this._getLocalUpper(event, beat);
        numBeats += localUpper * (beat % 1);
      }

      normBeat = numBeats / event.signature.upper;
    } else {
      normBeat = (beat - 1) / event.numBeats;
    }

    return normBeat;
  }

  /**
   * For irregular signatures, return the right upper value accroding to the beat
   */
  _getLocalUpper(event, beat) {
    beat = Math.floor(beat);
    let localUpper;

    if (event.signature.additive.length === 0) {
      // only last beat can be lower than unit.upper
      if (beat === event.numBeats) {
        localUpper = event.signature.upper - event.unit.upper * (beat - 1);
      } else {
        localUpper = event.unit.upper;
      }
    } else {
      localUpper = event.signature.additive[beat - 1];
    }

    return localUpper;
  }

  /**
   * Return the duration of a beat, with curve applied. If beat is a floating
   * point value, duration is the time until the next full beat
   */
  _getBeatDuration(event, bar, beat) {
    const length = 1 - (beat % 1);
    beat = Math.floor(beat);

    if (event.duration) {
      // there is no possible tempo curve in absolute duration events
      return event.duration * length;
    }

    // compute bpm according to eventual curve
    let bpm;

    if (event.tempo.curve) {
      bpm = this._getBpmInCurve(event.tempo.curve, bar, beat);
    } else {
      bpm = event.unit.bpm;
    }

    if (event.signature.type === 'irregular') {
      // adapt duration according to local unit
      const localUpper = this._getLocalUpper(event, beat);
      const beatRatio = localUpper / event.unit.upper;
      const unitDuration = 60 / bpm;

      return unitDuration * beatRatio * length;
    } else {
      return 60 / bpm * length;
    }
  }

  /**
   * Return the duration of a bar, without curves applied
   */
  _getBarDuration(event) {
    const beatDuration = 60 / event.unit.bpm;
    const numBeats = event.signature.upper / event.unit.upper;

    return beatDuration * numBeats;
  }

  /**
   * Return the location, with integer beat, that is just after the given one
   */
  _getNextLocation(event, bar, beat) {
    beat = Math.floor(beat) + 1;

    if (beat > event.numBeats) {
      // end of score, don't go to next bar
      if (event.end === true) {
        return null;
      }

      bar += 1;
      beat = 1;
    }

    return { bar, beat };
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
  _getNumBarNormalizedWithinEvent(event, startBar, startBeat, endBar, endBeat) {
    const numBarNormalized = (endBar - (startBar + 1)) // number of full bars
        + 1 - this._normalizeBeat(event, startBeat) // duration from event beat to next bar
        + this._normalizeBeat(event, endBeat); // duration from bar start to beat

    return numBarNormalized;
  }

  /**
   * Return the number of units in the given interval, the returned value is
   * normalized according to the duration of a bar of the start event.
   *
   * Used to compute the current position in the curve
   */
  _getNumBarNormalizedAccrosEvents(startBar, startBeat, endBar, endBeat) {
    let numUnits = 0;

    const eventAtStart = this._getEventAtLocation(startBar, startBeat);
    const barDuration = this._getBarDuration(eventAtStart);
    const startIndex = this.score.indexOf(eventAtStart);

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
      const numBarNormalized = this._getNumBarNormalizedWithinEvent(
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
   * Compute the bpm of the given beat within the curve
   */
  _getBpmInCurve(curve, bar, beat) {
    const { start, end, exponent } = curve;

    const event = this._getEventAtLocation(start.bar, start.beat);
    const numBeatsPerBar = event.signature.upper / event.unit.upper
    // this is expressed in bar unit
    const curveLength = this._getNumBarNormalizedAccrosEvents(start.bar, start.beat, end.bar, end.beat);
    const positionInCurve = this._getNumBarNormalizedAccrosEvents(start.bar, start.beat, bar, beat);
    // express in beat unit
    const position = positionInCurve * numBeatsPerBar;
    const length = curveLength * numBeatsPerBar;
    // the first event in the curve should already be faster so we add 1 to the normalization
    const normPosition = (position + 1) / (length + 1);

    const bpm = start.bpm + (end.bpm - start.bpm) * Math.pow(normPosition, exponent);

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

    const { upper, lower, bpm } = event.unit;

    // most common behavior
    if (event.tempo.curve === null) {
      // @note: we can ignore lower as _getUnitFromEvent implies that it is the
      // same as signature.lower
      const numBasisInBar = event.signature.upper / upper;
      const basisDuration = 60 / bpm;
      const barDuration = numBasisInBar * basisDuration;
      const numBarNormalized = this._getNumBarNormalizedWithinEvent(
        event,
        event.bar,
        event.beat,
        targetBar,
        targetBeat
      );

      return numBarNormalized * barDuration;
    } else {
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
