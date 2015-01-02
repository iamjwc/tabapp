var env = T("perc", {a:0, r:1000});
var pluck = T("PluckGen", {env:env, mul:0.5}).play();

var MINUTE_IN_MS = 60000;

var bpm = 120;

player = T("interval", {interval:MINUTE_IN_MS / (bpm * 3 * 4)}, function(count) {
  
  //console.log(count);
  ///var noteNum  = 69 + [0, 2, 4, 5, 7, 9, 11, 12][count % 8];
  //var noteNum2 = 69 + [0, 2, 4, 5, 7, 9, 11, 12][(count+2) % 8];
  //var velocity = 64 + (count % 64);
  //pluck.noteOn(noteNum, velocity);

  // down beat
  if (count % 12 == 0) {
  pluck.noteOn(40, 64);
  }

  // one and
  if (count % 6 == 0) {
    pluck.noteOn(44, 64);
  }

  // Triplets
  if (count % 2 == 0) {
    pluck.noteOn(47, 64);
  }

  //if ((count+2) % 8 == 0) {
   // pluck2.noteOff(noteNum2);
  //}
})



$(function() {
  $('#start').on('click', function() {
    player.start();
  });
  $('#stop').on('click', function() {
    player.stop();
  });
});

/* 
// To play a single tone.

p = T("PluckGen", {env:T("perc", {a:0, r:1000}), mul:0.5}).play();
p.noteOn(40, 64);

*/
