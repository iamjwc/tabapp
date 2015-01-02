var TabParser = Backbone.Model.extend({
  /* Takes a tab spread over multiple lines and returns the
   * tab as a single long line.
   */
  linearizeTab: function(tabString) {
    var lines = tabString.split("\n\n");

    var strings = lines.shift().split("\n");
    while (lines.length > 0) {
      var newLines = lines.shift().split("\n");
      for (var i in newLines) {
        strings[i] = [strings[i], newLines[i]].join("")
      }
    }

    return strings.join("\n").replace(/\/\//g, "/").replace(/\|\|/g, "|");
  },

  /* Takes a linear tab string and splits it into an array
   * of measures without bar lines.
   *
   * Removes blank lines caused by splitting on | or / and
   * having those chars at the very beginning and end of the
   * lines.
   */
  splitTabIntoMeasures: function(tabString) {
    var lines = tabString.split("\n");

    lines = _(lines).map(function(line, idx) {
      if (idx == 0) {
        return line.split("/")
      } else {
        return line.split("|")
      }
    });

    var measures = _.zip.apply(_, lines).map(function(m) { return m.join("\n") });

    return _(measures).reject(function(m) {
      // Remove blank lines.
      return m.match(/^\n+$/);
    });
  },

  /* Figure out how many beats are in this measure.
   */
  beatsInMeasure: function(measureString) {
    return measureString.split("\n")[0].split("+").length - 1;
  },

  numberOfStrings: function(measureString) {
    return measureString.split("\n").length - 1;
  },

  /* Measure has a start repeat sign.
   */
  measureStartsRepeat: function(measureString) {
    return measureString[0] == ":";
  },

  /* Measure has a end repeat sign.
   */
  measureEndsRepeat: function(measureString) {
    return measureString[measureString.length-1] == ":";
  },

  parseNotesFromMeasure: function(measureString) {
    var lines = measureString.split("\n");

    var guideLine = lines.shift();

    var notes = [];

    for (var j in lines) {
      var line = lines[j];
      var modifier = null;
      var fretDigit = "";

      var notesOnLine = [];
      var beat = 0;
      var subBeat = 0;

      for (var i in guideLine) {
        if (guideLine[i] == "+") {
          beat += 1;
          subBeat = 0;
        } else if (guideLine[i] == "-") {
          subBeat += 1;
        }

        if (line[i].match(/\d/)) {
          fretDigit += line[i]
        } else {
          // If we are not on a fret digit and there is
          // already a fret digit saved, then we have
          // completed parsing the note.
          if (fretDigit.match(/\d/)) {
            notesOnLine.push({
              fret: Number(fretDigit),
              modifier: modifier,
              stringIndex: Number(j),
              beat: beat,
              subBeat: subBeat,
            });

            modifier = null;
            fretDigit = "";
          }

          if (line[i] == "/") {
            modifier = "slide";
          } else if (line[i] == "h" || line[i] == "p") {
            modifier = "slur";
          } else if (line[i] == "(") {
            modifier = "harmonic";
          }
        }
      }

      notes.push(notesOnLine);
    }

    return notes;
  },

  parseMeasure: function(measureString) {
    return {
      beats: this.beatsInMeasure(measureString),
      startsRepeat: this.measureStartsRepeat(measureString),
      endsRepeat: this.measureEndsRepeat(measureString),
      notes: this.parseNotesFromMeasure(measureString),
    }
  },

  parse: function(tabString) {
    var linearTab = this.linearizeTab(tabString);
    var guideLine = linearTab.split("\n")[0];

    console.log("\n"+linearTab);

    var tabObject = new Tab({
      numberOfStrings: this.numberOfStrings(linearTab),
    });

    var measures = this.splitTabIntoMeasures(linearTab);
    for (var i in measures) {
      console.log("\n" + measures[i]);
      var parsedMeasure = this.parseMeasure(measures[i]);
      console.log(parsedMeasure);

      var measureObject = new Measure({
        tab: tabObject,
        beats: parsedMeasure.beats,
        startsRepeat: parsedMeasure.startsRepeat,
        endsRepeat: parsedMeasure.endsRepeat,
      });
      var notes = _(parsedMeasure.notes).flatten();
      for (var j in notes) {
        measureObject.get('notes').add({
          fret: notes[j].fret,
          modifier: notes[j].modifier,
          stringIndex: notes[j].stringIndex,
          beat: notes[j].beat,
          subBeat: notes[j].subBeat,
        });
      }
      tabObject.get('measures').add(measureObject);
    }

    return tabObject;
  },
});
