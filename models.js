var Note = Backbone.Model.extend({
  isHarmonic: function() {
    return this.get('modifier') == 'harmonic';
  },
});

var Measure = Backbone.Model.extend({
  initialize: function() {
    this.set('notes', new Backbone.Collection([], {
      model: Note
    }));
  },

  toString: function() {
    var beats = this.get('beats');

    var s = [];

    for (var i = 0, n = beats; i < n; ++i) {

      var s1 = this.beatAndSubBeatToString(i+1, 0, false);
      s1 = s1.split("\n");
      for (var j = 0, m = s1.length; j < m; ++j) {
        s[j] = s[j] || "";
        s[j] += s1[j];
      }

      var s2 = this.beatAndSubBeatToString(i+1, 1, i+1 == n);
      s2 = s2.split("\n");
      for (var j = 0, m = s2.length; j < m; ++j) {
        s[j] += s2[j];
      }
    }

    console.log("\n" + s.join("\n"));

    return s.join("\n");
  },

  beatAndSubBeatToString: function(beat, subBeat, isLastBeatAndSubBeat) {
    var leftGutterWidth  = 1;
    var charWidth        = 1;
    var rightGutterWidth = 0;

    var notes = this.notesAtBeatAndSubBeat(beat, subBeat);
    
    var harmonicInColumn    = this.isModifierInNotes('harmonic', notes);
    var doubleDigitInColumn = this.isDoubleDigitInNotes(notes);
    //var InColumn = _(notes).some(function(n) { return note.get('modifier') == 'harmonic' });
    
    if (harmonicInColumn) {
      rightGutterWidth = 1;
    }
    
    if (doubleDigitInColumn) {
      charWidth = 2;
    }

    if (false && isTripletBar(beat)) {
      // NOT YET IMPLEMENTED
      leftGutterWidth  = 1;
      rightGutterWidth = 2;
    }

    // Last beat gets an extra right gutter.
    if (isLastBeatAndSubBeat) {
      rightGutterWidth = 1;
    }

    var guideLine = this.guideLineToString(subBeat == 0, leftGutterWidth, charWidth, rightGutterWidth);

    var s = [guideLine];

    for (var i = 0, n = this.get('tab').get('numberOfStrings'); i < n; ++i) {
      s.push(this.lineToString(i, notes, leftGutterWidth, charWidth, rightGutterWidth));
    }

    return s.join("\n");
  },

  guideLineToString: function(isBeat, leftGutterWidth, charWidth, rightGutterWidth) {
    var s = [];

    s.push(this.repeatString(" ", leftGutterWidth));

    if (isBeat) {
      s.push("+");
    } else {
      s.push("-");
    }

    s.push(this.repeatString(" ", (charWidth-1) + rightGutterWidth));

    return s.join("");
  },

  repeatString: function(string, times) {
    var s = [];

    for (var i = 0; i < times; ++i) {
      s.push(string);
    }

    return s.join("");
  },

  lineToString: function(stringIndex, notes, leftGutterWidth, charWidth, rightGutterWidth) {
    var note = _(notes).find(function(note) {
      return note.get('stringIndex') == stringIndex;
    });

    var s = [];

    if (note) {
      if (note.isHarmonic()) {
        s.push(this.repeatString("-", leftGutterWidth - 1));
        s.push("(" + note.get('fret') + ")")
        s.push(this.repeatString("-", rightGutterWidth - 1));
      } else {
        if (note.get('modifier') == 'slide') {
          s.push(this.repeatString("-", leftGutterWidth - 1));
          s.push("/");
        } else if (note.get('modifier') == 'slur') {
          s.push(this.repeatString("-", leftGutterWidth - 1));
          s.push("p");
        } else {
          s.push(this.repeatString("-", leftGutterWidth));
        }
        s.push(note.get('fret'))
        s.push(this.repeatString("-", rightGutterWidth));
      }
    } else {
      s.push(this.repeatString("-", leftGutterWidth + charWidth + rightGutterWidth));
    }

    return s.join("");
  },

  notesAtBeatAndSubBeat: function(beat, subBeat) {
    return this.get('notes').select(function(note) { return note.get('beat') == beat && note.get('subBeat') == subBeat });
  },

  isModifierInNotes: function(modifier, notes) {
    return _(notes).some(function(n) {
      return n.get('modifier') == modifier;
    });
  },

  isDoubleDigitInNotes: function(notes) {
    return _(notes).some(function(n) {
      return n.get('fret') > 9;
    });
  },
});

var Tab = Backbone.Model.extend({
  initialize: function() {
    this.set('measures', new Backbone.Collection([], {
      model: Measure,
    }));
  },
});

