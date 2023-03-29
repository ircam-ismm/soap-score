export function writeScore(eventList) {
  let output = ``;
  let currentBar = null;
  let currentLine = ``;

  eventList.forEach((event) => {
    if (event.bar !== currentBar) {
      output += currentLine + '\n';

      currentLine = ``;
      currentBar = event.bar;
    }

    if (event.beat === 1) {
      currentLine += `BAR ${event.bar} `;
    } else {
      currentLine += `|${event.beat}`;
    }

    if (event.signature) {
      currentLine += `[${event.signature.name}] `;
    }

    if (event.tempo) {
      currentLine += `TEMPO [${event.tempo.basis.name}]=${event.tempo.bpm} `;
    }

    if (event.label) {
      currentLine += `"${event.label}"`;
    }

    if (event.fermata) {
      // currentLine += `FERMATA ${event.fermata}`
    }
  });

  output += currentLine + '\n';
  return output;
}
