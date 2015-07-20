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

  splitMeasureIntoSubColumns: function(measureMLString) {
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

  /* Takes a single column's line and converts
   * it to a Note, if it isn't blank. Handles
   * parsing the modifier, as well.
   */
  subColumnLineToNote: function(line, noteAttributes) {
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

      return new Note(_.extend({
        fret: Number(fret),
        modifier: modifier,
      }, noteAttributes || {}));
    }
  },

  /* Takes a single column as a string.
   * Returns a new Column object with the notes
   * from the string parsed into Note objects.
   */
  buildColumnObjectFromSubColumns: function(subcolumns) {
    var c = new Column({
    });

    var guideLine = _(subcolumns).map(function(sc) {
      return sc.lines[0];
    }).join("");

    var subdivisions = this.guideLineTimingSubdivisions(guideLine);

    for (var i = 0, n = subcolumns.length; i < n; ++i) {
      for (var j = 0, m = subcolumns[i].lines.length-1; j < m; ++j) {
        var note = this.subColumnLineToNote(subcolumns[i].lines[j+1], {
          localPosition: subdivisions[i],
          stringIndex: j,
        });

        if (note) {
          c.get('notes').add(note)
        }
      }
    }

    return c;
  },

  /* Takes a guideLine for a single column and
   * returns an array of the subdivisions the
   * subcolumns are at.
   *
   * 12 % 12 == 0  |+           |  1 quarter note
   * 12 % 6  == 0  |+     -     |  2 eighth
   * 12 % 4  == 0  |+   -   -   |  3 eighth note triplets
   * 12 % 3  == 0  |+  .  -  .  |  4 sixteenth notes
   * 12 % 2  == 0  |+ . . - . . |  6 sixteenth note triplets
   *
   * Ex:
   *
   *   guideLineTimingSubdivisions(" + -")
   *   => [0, 6]
   *
   *   guideLineTimingSubdivisions(" + ")
   *   => [0]
   *
   *   guideLineTimingSubdivisions(" + . . - .")
   *   => [0, 2, 4, 6, 9]
   *
   */
  guideLineTimingSubdivisions: function(guideLine) {
    guideLine = guideLine.replace(/\s/g, "");

    var subdivisions = [0];

    if (guideLine.indexOf("+..") > -1) {
      subdivisions.push(2);
      subdivisions.push(4);
    } else if (guideLine.indexOf("+.") > -1) {
      subdivisions.push(3);
    }

    if (guideLine.indexOf("--") > -1) {
      subdivisions.push(4)
      subdivisions.push(8)
    } else if (guideLine.indexOf("-..") > -1) {
      subdivisions.push(6);
      subdivisions.push(8);
      subdivisions.push(10);
    } else if (guideLine.indexOf("-.") > -1) {
      subdivisions.push(6);
      subdivisions.push(9);
    } else if (guideLine.indexOf("-") > -1) {
      subdivisions.push(6);
    }

    return subdivisions;
  },

  /* Takes an array of subcolumns and groups them by
   * number of columns within the array.
   *
   * Assumes the first subcolumn is the start of a
   * column.
   */
  subColumnsGroupedIntoColumns: function(subColumns) {
    return _(subColumns).inject(function(a, sc) {
      // Put a new column in the output array when we
      // come across a new beat.
      if (sc.lines[0].match(/\+/)) {
        a.push([])
      }
      
      // Add the subcolumn to the most recent column.
      a[a.length-1].push(sc);

      return a;
    }, []);
  },


  /*
   * Split the metadata string and tab string into
   * two pieces.
   */
  splitMetadataAndTab: function(tabString) {
    var arr = tabString.split("\n");

    var i = _.findIndex(arr, function(line) {
      return line.match(/^\|/);
    })

    return {
      metadataString: _.head(arr, i-1).join("\n"),
      tabString:      _.tail(arr, i).join("\n"),
    }
  },

  parseMetadata: function(metadataString) {
    var titleAndArtist = metadataString.split("\n")[0].split(" by ")

    return {
      title: titleAndArtist[0],
      artist: titleAndArtist[1],
    }
  },

  parse: function(tabString) {
    var h = this.splitMetadataAndTab(tabString);
    console.log(h);

    var metadataString = h.metadataString;
    var metadata = this.parseMetadata(metadataString);

    var tabString = h.tabString;
    var linearTab = this.linearizeTab(tabString);

    // Trash any ">" before we go further, because they are
    // only cosmetic.
    linearTab = linearTab.replace(/\>/g, "-");

    var guideLine = linearTab.lines[0];

    var tabObject = new Tab({
      title: metadata.title,
      artist: metadata.artist,
      numberOfStrings: this.numberOfStrings(linearTab),
    });

    var measures = this.splitTabIntoMeasures(linearTab);
    for (var i in measures) {
      var measureObject = new Measure({
        tab: tabObject,
        startsRepeat: this.measureStartsRepeat(measures[i]),
        endsRepeat: this.measureEndsRepeat(measures[i]),
      });

      var subColumns = this.splitMeasureIntoSubColumns(measures[i]);
      var subColumnsGroupedIntoColumns = this.subColumnsGroupedIntoColumns(subColumns);
      for (var j in subColumnsGroupedIntoColumns) {
        if (i == "2" && j == "1") {
          console.log("\n"+measures[i].toString());
        }

        var c = this.buildColumnObjectFromSubColumns(subColumnsGroupedIntoColumns[j]);
        measureObject.get('columns').add(c);
      }

      tabObject.get('measures').add(measureObject);
    }

    return tabObject;
  },
});
