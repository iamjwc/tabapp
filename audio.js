var env = T("perc", {a:100, r:500});
var pluck = T("PluckGen", {env:env, mul:0.5}).play();


var bpm = 120;

Player = Backbone.Model.extend({
  MINUTE_IN_MS: 60000,

  defaults: {
    bpm: 120,
    measureIndex: 0,
    tabPosition: 0,
  },

  initialize: function() {
  },

  play: function() {
  },

  /* Computes the amount of time between calls
   * to the function to play audio.
   */
  interval: function() {
    return this.MINUTE_IN_MS / (this.get('bpm') * 3 * 4);
  },
  
});

var playHeadMeasure = 0;
var playHeadBeat = 0;
var playHeadEighthBeat = 0;
var playHeadTripletBeat = 0;
var playHeadSixteenthBeat = 0;
var tuning = [64, 59, 55, 50, 45, 40];

player = T("interval", {interval:60000 / (bpm * 3 * 4)}, function(count) {
  var tab = tabView.model;
  var currentMeasure = tab.get('measures').at(playHeadMeasure);

  if (!currentMeasure) {
    player.stop();
    return;
  }

  // Don't play anything that doesn't fall on an eighth note right now.
  if (count % 6 != 0) {
    return;
  }

  // Play each fretted note at this point in time.
  var notes = currentMeasure.notesAtBeatAndSubBeat(playHeadBeat, playHeadEighthBeat);
  _(notes).each(function(note) {
    pluck.noteOn(tuning[note.get('stringIndex')] + note.get('fret'), 200);
  });

  // down beat
  if (count % 12 == 0) {
    playHeadBeat += 1;
    playHeadEighthBeat = 0;
    playHeadTripletBeat = 0;
    playHeadSixteenthBeat = 0;
  } else if (count % 6 == 0) {
    // one and
    playHeadEighthBeat += 1;
  }

  // Triplets
  if (count % 4 == 0) {
    playHeadTripletBeat += 1;
    //return;
  }

  if (playHeadBeat > currentMeasure.get('beats')) {
    playHeadMeasure += 1;
    playHeadBeat = 1;
    playHeadEighthBeat = 0;
    currentMeasure = tab.get('measures').at(playHeadMeasure);
  }
})



$(function() {
 $('#start').on('click', function() {
    playHeadMeasure = 0;
    playHeadBeat = 0;
    playHeadEighthBeat = 0;
    playHeadTripletBeat = 0;
    playHeadSixteenthBeat = 0;
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
