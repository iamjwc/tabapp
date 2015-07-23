
Player = Backbone.Model.extend({
  MINUTE_IN_MS: 60000,

  defaults: {
    bpm: 100,
    position: 0,
    shouldLoop: true,
  },

  initialize: function() {
    this.env   = T("perc", {a:100, r:500});
    this.pluck = T("PluckGen", {
      env: this.env,
      mul:0.5
    });

    var self = this;
    this.on('change:bpm', function() {
      if (self.player) {
        self.player.interval = self.interval();
      }
    });
  },

  loop: function() {
    this.set("shouldLoop", !this.get("shouldLoop"));
  },

  play: function(range) {
    this.stop();

    var self = this;

    var totalLength = tab.totalLength();

    var startingPosition, endingPosition;


    this.glide = T("param");
    var wave = T("osc", {
      //wave: "tri",
      
      //wave: "konami",
      //wave: "saw",
      //fb: "konami",
      wave: "wavc(0200080f)",
      mul: 0.35,
      freq: this.glide,
    })

    //wave = T("comp", {thresh:-8, knee:300, ratio:204, gain:0}, wave);
    //wave = T("eq", { params:{hpf:[50,1],lmf:[828,1.8,18.3],mf:[2400,2.2,-24,5],lpf:[5000,1.1]} }, wave);
    // Start using note.get('width') instead of hardcoding 4.
    if (true) {
    this.env   = T("perc", {a:100, d:300, r:500, r:4*this.interval()});
    this.pluck = T("PluckGen", {
      env: this.env,
      mul:0.5
    });
    } else {

    this.env = T("adsr", {
      // Attack
      a:0,
    
      // Delay
      d:300,
      //    d: 0,
    
      // Sustain
      s:0,
    
      // Release
      r:50
      //    r: 0,
    
    }, wave);
    }




    // Get a Hz frequency from midi number with this .
    // midicps.at(69) # => 440.0
    var midicps = T("midicps");

    if (range) {
      startingPosition = range[0];
      endingPosition = range[1];
    } else {
      startingPosition = 0;
      endingPosition = totalLength;
    }

    var localCount = startingPosition;

    this.player = T('interval', { interval: this.interval() }, function(count) {
      if (localCount >= endingPosition) {
        if (self.get('shouldLoop')) {
          localCount = startingPosition
        } else {
          self.stop();
          return;
        }
      }

      var locals = tab.globalPositionToLocalPosition(localCount);
      var measure = tab.get('measures').at(locals.measureIndex);
      var column = measure.get('columns').at(locals.columnIndex);
      var notes = column.notesAtSubdivision(locals.localPosition);

      var playedSomethingThisSD = false;
      for (var i = 0, n = notes.length; i < n; ++i) {
        var note = notes[i];

        var noteVal = tuning[note.get('stringIndex')] + note.get('fret') + Number(tab.get('transposition'));

        self.glide.set({
          value: midicps.at(noteVal),
        });
        //self.glide.welTo(
        //  midicps.at(noteVal+3),
        //  "100ms"
        //  //self.interval()// + "ms"
        //);
        //self.env.bang();

        self.pluck.noteOn(noteVal, note.get('width') * self.player.interval);
      }

      self.trigger('player:at', {
        measureIndex: locals.measureIndex,
        columnIndex: locals.columnIndex,
        localPosition: locals.localPosition,
        globalPosition: localCount-startingPosition,
        totalLength: (endingPosition - startingPosition),
      });

      localCount += 1;
    });

    this.fft = T("spectrum", {size:64, interval:1000 / 30}).on("data", function() {
      self.fft.plot({target:canvas});
    }).listen(this.env);

    this.pluck.play();
    this.env.play();
    this.player.start();
  },

  stop: function() {
    if (this.player) {
      this.env.pause();
      this.player.stop();
      this.player = null;
    }

    this.trigger('player:stop', {});
  },

  /* Computes the amount of time between calls
   * to the function to play audio.
   */
  interval: function() {
    /* I'm multiplying the BPM by 2 here because 100bpm
     * seems like what I'm used to for an average BPM,
     * not 200bpm. 100 looks correct, 200 sounds correct,
     * thus, multiply this by 2. Maybe someone smarter
     * than I can explain this.
     */
    return this.MINUTE_IN_MS / (2 * this.get('bpm') * Column.SUBDIVISIONS);
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
