
Player = Backbone.Model.extend({
  MINUTE_IN_MS: 60000,

  defaults: {
    bpm: 200,
    position: 0,
    shouldLoop: true,
  },

  initialize: function() {
    this.env   = T("perc", {a:100, r:500});
    this.pluck = T("PluckGen", {
      env: this.env,
      mul:0.5
    });
  },

  loop: function() {
    this.set("shouldLoop", !this.get("shouldLoop"));
  },

  play: function() {
    this.stop();

    var tuning = [64, 59, 55, 50, 45, 40];

    var self = this;

    var totalLength = tab.totalLength();
    // Store 'modBy' for looping.
    var modBy = 0;

    this.player = T('interval', { interval: this.interval() }, function(count) {
      if (count == modBy) {
        if (this.get('shouldLoop')) {
          modBy = totalLength;
        } else {
          modBy = 0;
        }
      }

      if (modBy) {
        count = count % modBy;
      }

      var locals = tab.globalPositionToLocalPosition(count);
      var measure = tab.get('measures').at(locals.measureIndex);

      if (!measure) {
        self.stop();
        return;
      }

      var column = measure.get('columns').at(locals.columnIndex);
      var notes = column.notesAtSubdivision(locals.localPosition);

      var playedSomethingThisSD = false;
      for (var i = 0, n = notes.length; i < n; ++i) {
        var note = notes[i];

        self.pluck.noteOn(tuning[note.get('stringIndex')] + note.get('fret'), 50);
      }

      self.trigger('player:at', {
        measureIndex: locals.measureIndex,
        columnIndex: locals.columnIndex,
        localPosition: locals.localPosition,

        globalPosition: count,
        totalLength: totalLength,
      });

    });

    this.pluck.play();
    this.player.start();
  },

  stop: function() {
    if (this.player) {
      this.player.stop();
    }

    this.trigger('player:stop', {});
  },

  /* Computes the amount of time between calls
   * to the function to play audio.
   */
  interval: function() {
    return this.MINUTE_IN_MS / (this.get('bpm') * Column.SUBDIVISIONS);
  },
  
});

/*

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




/* 
// To play a single tone.

p = T("PluckGen", {env:T("perc", {a:0, r:1000}), mul:0.5}).play();
p.noteOn(40, 64);

*/
