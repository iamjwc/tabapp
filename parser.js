var TabParser = Backbone.Model.extend({
  /* Takes a tab spread over multiple lines and returns the
   * tab as a single long line.
   */
  linearizeTab: function(tabString) {
    var lines = _(tabString.split("\n\n")).map(function(tabLine) {
      return MultilineString.fromString(tabLine)
    });

    var line = lines.shift();
    while (lines.length > 0) {
      line = line.add(lines.shift());
    }

    return line.replace(/\/\//g, "/").replace(/\|\|/g, "|");
  },

  /* Might not actually be useful.
   */
  splitTabIntoColumns: function(tabString) {
    return _(this.splitTabIntoMeasures(tabString))
      .chain()
      .map(function(measureString) {
        return this.splitMeasureIntoColumns(measureString);
      })
      .flatten()
      .value();
  },

  /* Takes a linear tab string and splits it into an array
   * of measures without bar lines.
   *
   * Removes blank lines caused by splitting on | or / and
   * having those chars at the very beginning and end of the
   * lines.
   */
  splitTabIntoMeasures: function(tabMLString) {
    // Split the tab by measures.
    var measures = tabMLString.split("|");

    return _(measures).reject(function(m) {
      // Remove blank lines.
      return m.toString().match(/^\n+$/);
    });
  },

  splitMeasureIntoColumns: function(measureMLString) {
    // Trash repeat signs because they aren't
    // important here.
    measureMLString = measureMLString.replace(/:/g, "");
      
    var guideLine = measureMLString.lines[0];

    var subColumnWidths = this.subColumnWidths(guideLine);

    // Split lines into subcolumns.
    var substringStart = 0;
    var subColumns = _(subColumnWidths).map(function(width) {
      var subColumn = measureMLString.substring(substringStart, substringStart + width);

      substringStart += width;

      return subColumn;
    });
    return subColumns;

    /*
    // Merge subcolumns back into individual, whole columns.
    var columns = [];
    var currentColumn = [];
    for (var i in subColumns) {
      i = Number(i);

      var nextSubColumnStartsNewColumn = subColumns[i+1] && subColumns[i+1].lines[0].match(/\+/);
      var isLastSubColumn = i == subColumns.length-1;

      currentColumn.push(subColumns[i]);

      if (nextSubColumnStartsNewColumn || isLastSubColumn) {
        columns.push(currentColumn);
        currentColumn = [];
      }
    }

    return columns;
    */
  },

  /* Figure out how wide each subcolumn in a measure is.
   *
   * Takes a guideLine and returns an array of widths for each
   * subcolumn.
   *
   * A subcolumn has 1 space before the note indicator (+/-/.)
   * that can hold a modifier and goes all the way until the next
   * subcolumn beginning.
   *
   * Very last character of the measure should *always* be simply
   * a spacer.
   */
  subColumnWidths: function(guideLine) {
    var subColumns = [];
    var currentColumn = "";

    for (var i = 0, n = guideLine.length-1; i < n; ++i) {
      var isVeryBeginningOfLine = i == 0;
      var isBeginningOfNewSubColumn = !!(guideLine[i] == " " && (guideLine[i+1] || "").match(/[\+\-\.]/));

      if (!isVeryBeginningOfLine && isBeginningOfNewSubColumn) {
        subColumns.push(currentColumn);
        currentColumn = "";
      }

      currentColumn += guideLine[i];
    }

    // Push last thing into subColumns.
    subColumns.push(currentColumn);

    return _(subColumns).map(function(sc) { return sc.length });
  },

  /* Figure out how many columns are in this measure.
   */
  columnsInMeasure: function(measureMLString) {
    return measureMLString.lines[0].split("+").length - 1;
  },

  numberOfStrings: function(measureMLString) {
    return measureMLString.lines.length - 1;
  },

  /* Measure has a start repeat sign.
   */
  measureStartsRepeat: function(measureMLString) {
    return measureMLString.lines[0][0] == ":";
  },

  /* Measure has a end repeat sign.
   */
  measureEndsRepeat: function(measureMLString) {
    var guideLine = measureMLString.lines[0];
    return guideLine[guideLine-1] == ":";
  },

  columnGuideLineToLocation: function(columnGuideLine) {
    if (columnGuideLine.match(/\+/)) {
      return "quarter";
    } else if (columnGuideLine.match(/\-/)) {
      return "eighth";
    } else if (columnGuideLine.match(/\./)) {
      return "sixteenth";
    }
  },

  /* Takes a single column's line and converts
   * it to a Note, if it isn't blank. Handles
   * parsing the modifier, as well.
   */
  columnLineToNote: function(line, stringIndex) {
    if (line.match(/\d/)) {
      var modifier;
      if (line[0] == "/") {
        modifier = "slide";
      } else if (line[0] == "h" || line[0] == "p") {
        modifier = "slur";
      } else if (line[0] == "<") {
        modifier = "harmonic";
      }

      var fret = line.match(/(\d+)/)[1];

      return new Note({
        fret: Number(fret),
        modifier: modifier,
        stringIndex: stringIndex,
      });
    }
  },

  /* Takes a single column as a string.
   * Returns a new Column object with the notes
   * from the string parsed into Note objects.
   */
  buildColumnObjectFromColumn: function(column) {
    var c = new Column({
      location: this.columnGuideLineToLocation(column.lines[0]),
    });

    for (var i = 1, n = column.lines.length; i < n; ++i) {
      var note = this.columnLineToNote(column.lines[i], i-1);
      if (note) {
        c.get('notes').add(note)
      }
    }

    return c;
  },

  parse: function(tabString) {
    var linearTab = this.linearizeTab(tabString);

    // Trash any ">" before we go further, because they are
    // only cosmetic.
    linearTab = linearTab.replace(/\>/g, "-");

    var guideLine = linearTab.lines[0];

    var tabObject = new Tab({
      numberOfStrings: this.numberOfStrings(linearTab),
    });

    var measures = this.splitTabIntoMeasures(linearTab);
    for (var i in measures) {
      var measureObject = new Measure({
        tab: tabObject,
        startsRepeat: this.measureStartsRepeat(measures[i]),
        endsRepeat: this.measureEndsRepeat(measures[i]),
      });

      var columns = this.splitMeasureIntoColumns(measures[i]);
      for (var j in columns) {
        measureObject.get('columns').add(this.buildColumnObjectFromColumn(columns[j]));
      }

      tabObject.get('measures').add(measureObject);
    }

    return tabObject;
  },
});
