export function scoreFromEvent(eventList) {
  let output = ``;
  let currentBar = null;
  let currentLine = ``;

  eventList.forEach((event) => {
    if (currentBar !== null && event.bar !== currentBar) {
      output += currentLine + '\n';

      currentLine = ``;
      currentBar = event.bar;
    }

    if (event.beat === 1) {
      currentLine += `BAR ${event.bar}`;
    } else {
      currentLine += `|${event.beat}`;
    }

    if (event.signature) {
      currentLine += `[${event.signature.name}]`;
    }

    if (event.bpm) {
      currentLine += `TEMPO ${event.basis.name}=${bpm}`;
    }

    if (event.label) {
      currentLine += `"${event.label}"`;
    }

    if (event.fermata) {
      currentLine += `FERMATA ${event.fermata}`
    }
      case 'FERMATA':

        if (lastWrittenBar !== e.bar) {
          output += `\nBAR ${e.bar}\n`
        }
        output += `|${e.beat} FERMATA `

        if (e.duration !== Infinity) {
          output += `[${e.duration}s]`;
        }

        output += `\n`;
        break;
    }
    }
  });
  return output;
}
