import { TransportEvent } from '@ircam/sc-scheduling';

class SoapProcessor {
  constructor(interpreter) {
    this.interpreter = interpreter;

    this.process = this.process.bind(this);
  }

  process(position, audioTime, event) {
    if (event instanceof TransportEvent) {
      return event.speed > 0 ? position : Infinity;
    }

    const { bar, beat } = this.interpreter.getLocationAtPosition(position);
    const infos = this.interpreter.getLocationInfos(bar, beat);

    this.bar = bar;
    this.beat = beat;
    this.infos = infos;

    console.log(infos);
    // const next = this.interpreter.getNextLocation();

    // getLocationInfos
    // getNextLocationInfos
    // console.log(next);

    return position + infos.dt;
  }
}

export default SoapProcessor;
