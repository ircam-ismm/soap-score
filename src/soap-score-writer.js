import isEqual from 'lodash.isequal';

export function writeScore(eventList) {
  let output = ``;
  let currentBar = null;
  let currentLine = ``;
  let previous = { signature: null, tempo: null };

  eventList.forEach((event) => {
    if (event.bar !== currentBar) {
      output += currentLine + '\n';

      currentLine = ``;
      currentBar = event.bar;
    }

    if (event.beat === 1) {
      currentLine += `BAR ${event.bar} `;
    } else {
      currentLine += `\n|${event.beat} `;
    }

    if (event.signature && !isEqual(event.signature, previous.signature)) {
      currentLine += `[${event.signature.name}] `;
      previous.signature = event.signature;
    }

    if (event.duration) {
      currentLine += `${event.duration}s `;
    }

    if (event.tempo && !isEqual(event.tempo, previous.tempo)) {
      currentLine += `TEMPO [${event.tempo.basis.name}]=${event.tempo.bpm} `;
      previous.tempo = event.tempo;

      if (event.tempo.curve) {
        currentLine += `curve ${event.tempo.curve.exponent} `;
      }

    }

    if (event.label) {
      currentLine += `"${event.label}" `;
    }

    if (event.fermata) {
      currentLine += `FERMATA [${event.fermata.basis.name}]=`
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
