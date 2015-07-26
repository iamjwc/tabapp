Serializers.MeasureSerializer = {
  toString: function(measure) {
    var columns = measure.get('columns');

    var s = [];

    for (var i = 0, n = columns; i < n; ++i) {

      var s1 = this.beatAndSubBeatToString(measure, i+1, 0, false);
      s1 = s1.split("\n");
      for (var j = 0, m = s1.length; j < m; ++j) {
        s[j] = s[j] || "";
        s[j] += s1[j];
      }

      var s2 = this.beatAndSubBeatToString(measure, i+1, 1, i+1 == n);
      s2 = s2.split("\n");
      for (var j = 0, m = s2.length; j < m; ++j) {
        s[j] += s2[j];
      }
    }

    console.log("\n" + s.join("\n"));

    return s.join("\n");
  },

  beatAndSubBeatToString: function(measure, beat, subBeat, isLastBeatAndSubBeat) {
    var leftGutterWidth  = 1;
    var charWidth        = 1;
    var rightGutterWidth = 0;

    var notes = this.notesAtBeatAndSubBeat(measure, beat, subBeat);
    
    var harmonicInColumn    = this.isModifierInNotes(measure, 'harmonic', notes);
    var doubleDigitInColumn = this.isDoubleDigitInNotes(measure, notes);
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

    var guideLine = this.guideLineToString(measure, subBeat == 0, leftGutterWidth, charWidth, rightGutterWidth);

    var s = [guideLine];

    for (var i = 0, n = measure.get('tab').get('numberOfStrings'); i < n; ++i) {
      s.push(this.lineToString(measure, i, notes, leftGutterWidth, charWidth, rightGutterWidth));
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
};
