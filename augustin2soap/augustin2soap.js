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
  let time = 0;
  if ( !isNaN(str) ) {
    time = parseFloat(str);
  } else {
    const a = str.split(':');
    switch (a.length) {
      case 2:
        console.log(2)
        break;
      case 3:
        break;
    }
    if (a.length === 2)
    time = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    // console.log(seconds);
    // time = null;
    // console.log(str);
  }
  return time
}

const data = fs.readFileSync(strInputFileName,{encoding:'utf8', flag:'r'});
const dataArray = data.split("\n");
const cleanArray = [];
let events = [];
let index = 0;
const cmd = ['fermata', 'timer'];

dataArray.forEach(line => {
  line = line.replace(",", "");
  line = line.replace(";", "");
  cleanArray.push((line.split(" ")));
});

cleanArray.forEach(line => {
  if (line.length > 1 && line.length < 4 ) {
    if ( cmd.includes(line[1]) ) {
      switch (line[1]) {
        case 'fermata':
          events.push({ bar : parseInt(line[0]) , beat : 1 , fermata : +Infinity });
          break;
        case 'timer':
          events.push({ bar : parseInt(line[0]) , beat : 1 , fermata : parseTime(line[2]) });
          break;
      }
    } else {
      // console.log(line)
      events.push({ bar : parseInt(line[0]) , beat : 1 , bpm : parseFloat(line[2]) });
      events.push({ bar : parseInt(line[0]) , beat : 1 , signature : convertSignature(line[1]) });
    }
  } else {
    console.log("this line cannot be parsed ", line);
  }
});
console.log(events);
// console.log(cleanArray)


