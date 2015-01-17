var Note = Backbone.Model.extend({
  defaults: {
    fret: null,
    modifier: null,

    // O-based string. For standard guitar tuning, E = 0, B = 1, G = 2, etc.
    stringIndex: null,

    // Position local to the column where the note should appear.
    // I'm not a fan of this design decision, but its easy and I'm
    // not really sure how to do it in a better way with Backbone.
    localPosition: null,
  },

  validate: function(attributes) {
    // Fret Validations
    if (!attributes.fret) {
      return "must specify fret";
    } else {
      if (attributes.fret < 0 || attributes.fret > 25) {
        return "must be valid fret"
      }
    }

    if (!attributes.localPosition) {
      return "must specify localPosition";
    } else if (attributes.localPosition < 0 || attributes.localPosition > Column.SUBDIVISTIONS) {
      return "invalid localPosition";
    }
  },

  isHarmonic: function() {
    return this.get('modifier') == 'harmonic';
  },
});

/* A 'beat' with N subdivisions.
 *
 * Graphically, here are the subdivisions:
 * 
 * 12 % 12 == 0  |+           |  1 quarter note
 * 12 % 6  == 0  |+     -     |  2 eighth
 * 12 % 4  == 0  |+   -   -   |  3 eighth note triplets
 * 12 % 3  == 0  |+  .  -  .  |  4 sixteenth notes
 * 12 % 2  == 0  |+ . . - . . |  6 sixteenth note triplets
 *
 * Width: 12
 *
 */
var Column = Backbone.Model.extend({
  defaults: {
  },

  validate: function(attributes) {
  },

  initialize: function() {
    this.set('notes', new Backbone.Collection([], {
      model: Note
    }));
  },

  notesAtSubdivision: function(i) {
    return this.get('notes').select(function(n) { return n.get('localPosition') == i });
  },
}, {
  SUBDIVISIONS: 12,
});

var Measure = Backbone.Model.extend({
  initialize: function() {
    this.set('columns', new Backbone.Collection([], {
      model: Column
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

  /* Takes a global "subdivision position" and returns
   * the measure, column and local position.
   */
  globalPositionToLocalPosition: function(position) {
    var localPosition = position % Column.SUBDIVISIONS;
    var globalColumnPosition = Math.floor(position / Column.SUBDIVISIONS);
    var measureIndex = 0;

    var currentMeasure = tab.get('measures').at(measureIndex);
    while (currentMeasure && globalColumnPosition >= currentMeasure.get('columns').length) {
      globalColumnPosition -= currentMeasure.get('columns').length;

      measureIndex += 1;
      currentMeasure = tab.get('measures').at(measureIndex);
    }

    return {
      localPosition: localPosition,
      measureIndex: measureIndex,
      columnIndex: globalColumnPosition,
    };
  }
});

