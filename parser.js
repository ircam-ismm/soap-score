import fs from 'node:fs';

const score = fs.readFileSync('./syntax-proposal.soap').toString();

const parseCommand = {
  TEMPO: elems => {
    const cmd = elems.shift();
    return {
      cmd,
      args: elems,
    }
  },
  MEASURE: elems => {
    const cmd = elems.shift();
    return {
      cmd,
      args: elems,
    }
  },
  FERMATA: elems => {
    const cmd = elems.shift();
    return {
      cmd,
      args: elems,
    }
  },
  TEMPO_CURVE: elems => {
    const cmd = elems.shift();
    return {
      cmd,
      args: elems,
    }
  },
};

const lines = score.split('\n');
// remove empty lines or comment lines
const parsed = lines
  .map(line => line.trim())
  // remove empty lines or comment lines
  .filter(line => {
    if (line === '' || /^\/\//.test(line)) {
      return false;
    }

    return true
  })
  // remove line ending comments
  .map(line => {
    const elems = line.split(' ').map(el => el.trim());

    let index = null;
    elems.forEach((el, i) => {
      if (el == '//') {
        index = i;
      }
    });

    if (index !== null) {
      elems.splice(index);
    }

    return elems;
  })
  .map(elems => {
    const cmd = elems[0];

    return parseCommand[cmd](elems);
  });

console.log(parsed);
