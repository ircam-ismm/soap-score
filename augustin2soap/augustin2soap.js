const fs = require('fs');

const inputFilename = process.argv.slice(2);
const strInputFileName = `./${inputFilename[0]}`
const outputFileName = `${inputFilename[0].slice(0,-4)}.soap`;
console.log('parsing ', strInputFileName, ' and saving into ', outputFileName);

function convertSignature(str) {
  const sigList = str.split("/");
  return {upper:parseInt(sigList[0]), lower:parseInt(sigList[1])};
}

function parseTime(str) {
  return str
}

const data = fs.readFileSync(strInputFileName,{encoding:'utf8', flag:'r'});
const dataArray = data.split("\n");
const cleanArray = [];
let events = [];
let index = 0;
const cmd = ['fermata', 'timer'];

dataArray.forEach(line => {
  line = line.replace(",","");
  line = line.replace(";", "");
  cleanArray.push((line.split(" ")));
});

cleanArray.forEach(line => {
  if (line.length === 3) {
    if (cmd.includes(line[1])) {
      switch (line[1]) {
        case 'fermata':
          // ne marche pas car 2 arguments dans ce cas
          events.push({ bar : parseInt(line[0]) , beat : 1 , fermata : +Infinity });
          break;
        case 'timer':
          events.push({ bar : parseInt(line[0]) , beat : 1 , fermata : parseTime(line[2]) });
          break;
      }
    } else {
      events.push({ bar : parseInt(line[0]) , beat : 1 , bpm : parseFloat(line[2]) });
      events.push({ bar : parseInt(line[0]) , beat : 1 , signature : convertSignature(line[1]) });
    }
  }
  // console.log(line);

});
// cleanArray.forEach()
console.log(events);
console.log(cleanArray)


