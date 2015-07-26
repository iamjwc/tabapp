var fs = require('fs');
var Midi = require('jsmidgen');

file = new Midi.File();
file
  .addTrack()

    .addNote(0, 'c4', 32)
    .addNote(0, 'd4', 32)
    .addNote(0, 'e4', 32)
    .addNote(0, 'f4', 32)
    .addNote(0, 'g4', 32)
    .addNote(0, 'a4', 32)
    .addNote(0, 'b4', 32)
    .addNote(0, 'c5', 32)

    // church organ
    .setInstrument(0, 0x13)

    .addNoteOn(0, 'c4', 64)
    .addNoteOn(0, 'e4')
    .addNoteOn(0, 'g4')
    .addNoteOff(0, 'c4', 47)
    .addNoteOff(0, 'e4')
    .addNoteOff(0, 'g4')

    .addNoteOn(0, 'c4', 1)
    .addNoteOn(0, 'e4')
    .addNoteOn(0, 'g4')
    .addNoteOff(0, 'c4', 384)
    .addNoteOff(0, 'e4')
    .addNoteOff(0, 'g4')
    ;

fs.writeFileSync('test2.mid', file.toBytes(), 'binary');