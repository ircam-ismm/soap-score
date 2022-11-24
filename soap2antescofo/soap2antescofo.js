import fs from 'node:fs';
import TimeSignature from '@tonaljs/time-signature';
import { soapScoreParser, soapFormatScore } from '../src/soap-score-parser.js';
import { checkSoapEvent } from '../src/check-soap-events.js';

const inputFilename = process.argv.slice(2);
const strInputFileName = `./${inputFilename[0]}`
const outputFileName = `${inputFilename[0].slice(0,-5)}.asco.txt`;
console.log('parsing ', strInputFileName, ' and saving into ', outputFileName);


function computeTick(upper) {
  let tick = [];
  for (let i = 0; i < upper; i++) {
    if (i === 0) {
      tick.push(75);
    } else {
      tick.push(76);
    }
  }
  return tick;
}

const score = fs.readFileSync(strInputFileName).toString();
const events = soapScoreParser(score);
const asco = [];
let output = ``;
let lastSignature = TimeSignature.get('1/4');

events.forEach(e => {
  checkSoapEvent(e);

  switch(e.type) {
    case 'BAR': {
      // on peut calculer tous les ticks de la mesure à partir du message bar
      if (e.signature !== null) {
        asco.push({
          bar: e.bar,
          ticks: computeTick(e.signature.upper),
        });
        lastSignature = e.signature;
      } else {
        asco.push({
          bar: e.bar,
          ticks: computeTick(lastSignature.upper),
        });
      }
      break;
    };
    case 'TEMPO': {
      // console.log(e.bar, e.beat, e.bpm);
      // we don't need tempo here
      break;
    };
    case 'LABEL': {
      break;
    }
  }
});

// fill missing bar
for (let i = 1; i <= asco[asco.length-1].bar; i++) {
  const thisBar = asco.find(e => {
    return e.bar === i;
  });
  if (thisBar === undefined) {
    asco.splice(i-1,0, {bar: i, ticks:asco[i-1].ticks});
  };
};

asco.forEach(e => {
  e.ticks.forEach((t,i) => {
    const thisBeat = events.find(event => {
      return (event.type === 'TEMPO') && (event.bar === e.bar) && (event.beat === i+1);
    });
    if (thisBeat !== undefined) {
      output += `BPM ${thisBeat.bpm}\n`
    }
    // console.log(`mesure ${e.bar} temps ${i+1}`)
    if (i === 0) {
      output += `NOTE ${t} 1 BAR_${e.bar}\n`
    } else {
      output += `NOTE ${t} 1\n`
    }
    if (i === e.ticks.length-1) {
      output += `\n`;
    }
  })
})

// console.log(output);

fs.writeFileSync(outputFileName, output);
console.log('done');

console.log("I don't parse tempo change when there are not on a beat (eg |4.5)");
console.log("I don't care about tempo basis and temps fort temps faible");
console.log("I don't care about LABEL");
console.log("I don't care about FERMATA");
console.log("I don't care about TEMPO curve");
