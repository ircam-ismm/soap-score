const fs = require('fs');

const inputFilename = process.argv.slice(2);
const strInputFileName = `./${inputFilename[0]}`
const outputFileName = `${inputFilename[0].slice(0,-4)}.soap`;
console.log('parsing ', strInputFileName, ' and saving into ', outputFileName);

const data = fs.readFileSync(strInputFileName,{encoding:'utf8', flag:'r'});
const dataArray = data.split("\n");
const cleanArray = [];

dataArray.forEach(line => {
  cleanArray.push(line.replace(";",""));
  // console.log(line);
})
console.log(cleanArray);

// console.log(dataArray);
