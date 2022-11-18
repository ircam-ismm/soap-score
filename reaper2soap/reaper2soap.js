let midiParser  = require('midi-parser-js');
let fs = require('fs')

// read a .mid binary (as base64)
fs.readFile('./midi_export.mid', 'base64', function (err,data) {
  // Parse the obtainer base64 string ...
  var midiArray = midiParser.parse(data);
  // done!
  console.log(midiArray);
  console.log(midiArray.track[0].event);
  console.log('88 is metric');
  console.log('81 is tempo : 60000000 / value');

});
