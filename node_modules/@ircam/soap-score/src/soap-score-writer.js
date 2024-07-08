import isEqual from 'lodash.isequal';

export function writeScore(eventList) {
  let output = ``;
  let currentBar = null;
  let currentLine = ``;
  let previous = { signature: null, tempo: null };

  eventList.forEach((event) => {
    if (event.bar !== currentBar || event.signature !== previous.signature) {
      output += currentLine + '\n';

      currentLine = ``;
      currentBar = event.bar;

      currentLine = `BAR ${event.bar} `;
    }

    if (event.beat !== 1) {
      currentLine += `\n|${event.beat} `;
    }

    if (event.signature && !isEqual(event.signature, previous.signature)) {
      currentLine += `${event.signature.value} `;
      previous.signature = event.signature;
    }

    if (event.duration) {
      currentLine += `${event.duration}s `;
    }

    if (event.tempo && !isEqual(event.tempo, previous.tempo)) {
      if (event.tempo.curve) {
        event.tempo.bpm = event.tempo.curve.start.bpm;
      }

      currentLine += `TEMPO ${event.tempo.basis.value}=${event.tempo.bpm} `;
      previous.tempo = event.tempo;

      if (event.tempo.curve) {
        currentLine += `curve ${event.tempo.curve.exponent} `;
      }

    }

    if (event.label) {
      currentLine += `"${event.label}" `;
    }

    if (event.fermata) {
      currentLine += `FERMATA ${event.fermata.basis.value}=`
      if (event.fermata.absDuration) {
        currentLine += `${event.fermata.absDuration}s `;
      } else if (event.fermata.relDuration) {
        currentLine += `${event.fermata.relDuration}* `;
      } else if (event.fermata.suspended) {
        currentLine += `? `;
      };
    };
  });

  output += currentLine + '\n';

  return output;
}
