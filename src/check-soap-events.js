function isTimeSignature(sig) {
  if (sig !== undefined) {
    if (sig === null) {
        return true;
      } else {
        return ('empty' in sig && 'name' in sig && 'type' in sig && 'upper' in sig &&    'lower' in sig && 'additive' in sig);
      }
  } else {
    return false;
  }
}

export function checkSoapEvent(event) {
  if (!('type' in event)) {
    throw new Error('`event.type` is mandatory: ' + JSON.stringify(event));
  }

  if (!('bar' in event)) {
    throw new Error('`event.bar` is mandatory: ' + JSON.stringify(event));
  }

  if (!Number.isInteger(event.bar)) {
    throw new Error('Invalid `event.bar`, should be Integer: ' + JSON.stringify(event));
  }

  if (!('beat' in event)) {
    throw new Error('`event.beat` is mandatory: ' + JSON.stringify(event));
  }

  if (!Number.isFinite(event.beat)) {
    throw new Error('Invalid `event.beat`, should be Float: ' + JSON.stringify(event));
  }

  switch (event.type) {
    case 'BAR': {
      if (!('signature' in event)) {
        throw new Error('`event.signature` is mandatory: ' + JSON.stringify(event));
      }

      if (!('duration' in event)) {
        throw new Error('`event.duration` is mandatory: ' + JSON.stringify(event));
      }

      // in BAR message, signature and duration can be both null
      // if (event.signature === null && event.duration === null) {
      //   throw new Error('`event.signature` and `event.duration` cannot be both null: ' + JSON.stringify(event));
      // }

      if (event.signature !== null && event.duration !== null) {
        throw new Error('`event.signature` and `event.duration` cannot be both non null: ' + JSON.stringify(event));
      }

      if (event.signature !== null && !isTimeSignature(event.signature)) {
        throw new Error('Invalid `event.signature`, should be TimeSignature: ' + JSON.stringify(event));
      }

      if (event.duration !== null && !Number.isFinite(event.duration)) {
        throw new Error('Invalid `event.duration`, should be Float: ' + JSON.stringify(event));
      }

      if (event.beat !== 1) {
        throw new Error('`event.type: "BAR"` should be only located on first beat' + JSON.stringify(event));
      }
      break;
    }
    case 'TEMPO': {
      if (!('basis') in event) {
        throw new Error('`event.basis` is mandatory: ' + JSON.stringify(event));
      }

      if (event.basis !== null && !isTimeSignature(event.basis)) {
        throw new Error('Invalid `event.basis`, should be TimeSignature: ' + JSON.stringify(event));
      }

      if (!('bpm') in event) {
        throw new Error('`event.bpm` is mandatory: ' + JSON.stringify(event));
      }

      if (event.bpm !== null && !Number.isFinite(event.bpm)) {
        throw new Error('Invalid `event.bpm`, should be Float: ' + JSON.stringify(event));
      }

      if (!('curve') in event) {
        throw new Error('`event.curve` is mandatory: ' + JSON.stringify(event));
      }

      if (event.curve !== null && !Number.isFinite(event.curve)) {
        throw new Error('Invalid `event.curve`, should be Float: ' + JSON.stringify(event));
      }
      break;
    }
    case 'FERMATA': {
      if (!('duration') in event) {
        throw new Error('`event.duration` is mandatory: ' + JSON.stringify(event));
      }

      if (event.duration !== null && Number.isNaN(event.duration)) {
        throw new Error('Invalid `event.duration`, should be Float or Infinity: ' + JSON.stringify(event));
      }
      break;
    }
    case 'LABEL': {
      if (!('label') in event) {
        throw new Error('`event.label` is mandatory: ' + JSON.stringify(event));
      }

      if (typeof event.label !== 'string') {
        throw new Error('`event.label` should be String: ' + JSON.stringify(event));
      }

      break;
    }
    default: {
      throw new Error('Unknown `event.type`: ' + JSON.stringify(event));
      break;
    }
  }
}
