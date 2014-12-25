

var Note = Backbone.Model.extend({
});

var Measure = Backbone.Model.extend({
  initialize: function() {
    this.set('notes', new Backbone.Collection([], {
      model: Note
    }));
  },
});

var Tab = Backbone.Model.extend({
  initialize: function() {
    this.set('measures', new Backbone.Collection([], {
      model: Measure,
    }));
  },
});

var tabString = [
  "/: + - + - + - + - / + - + - [+ - -] + - :/",
  "|:-----------------|---------------------:|",
  "|:-----------------|---------------------:|",
  "|:-----------------|-0--------3p2p0------:|",
  "|:-----------0-2p0-|-----------------2p0-:|",
  "|:-----0-1/2-------|---------------------:|",
  "|:-3---------------|---------------------:|",
  "",
  "/ + - + - + - + - + - /",
  "|---------------------|",
  "|---------------------|",
  "|-0-------------------|",
  "|---------------------|",
  "|---------------------|",
  "|---------------------|",
  "",
  "/ +  - +  -  +  -  +  -  / +   - + - + - + - /",
  "|------------------------|-------------------|",
  "|------------------------|-------------------|",
  "|------------------------|(12)---------------|",
  "|---------------12-14p12-|-------------------|",
  "|------12-13/14----------|-------------------|",
  "|-15---------------------|-------------------|",
  "",
  "/ + - + - / + - + - /",
  "|---------|---------|",
  "|---------|---------|",
  "|-0-2-3-4-|/5-------|",
  "|---------|---------|",
  "|---------|---------|",
  "|---------|---------|",
].join("\n");

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


var MeasureView = Backbone.View.extend({
  className: "measure",

  events: {
  },

  initialize: function() {
    this.listenTo(this.model, "change", this.render);

    this.$el.attr('style', '');
    this.$el.attr('id', '');
    this.$el.addClass('measure');

    var guideLine = $('<tr></tr>');
    for (var j = 0, m = this.model.get('beats'); j < m; ++j) {
      guideLine.append($('<th class="beat">-</th><th>-</th>'));
    }
    this.$('thead').append(guideLine);

    for (var i = 0, n = this.tab().get('numberOfStrings'); i < n; ++i) {
      var line = $('<tr></tr>');

      for (var j = 0, m = this.model.get('beats'); j < m; ++j) {
        line.append($('<td class="beat">-</td><td>-</td>'));
      }

      this.$('tbody').append(line);
    }

    var self = this;
    this.model.get('notes').each(function(note) {
      var string = self.getStringAtStringIndex(note.get('stringIndex'));
      var fret = self.getFretAtBeatAndSubBeatFromString(string, note.get('beat'), note.get('subBeat'));

      fret.text(note.get('fret'));
      fret.addClass(note.get('modifier'));
      // fret: notes[j].fret,
      // modifier: notes[j].modifier,
      // stringIndex: notes[j].stringIndex,
      // beat: notes[j].beat,
      // subBeat: notes[j].subBeat,
    });
  },

  getStringAtStringIndex: function(stringIndex) {
    return this.$('tr:nth-child('+stringIndex+')');
  },

  getFretAtBeatAndSubBeatFromString: function(string, beat, subBeat) {
    var td = $(string.find('td.beat')[beat-1]);

    for (var i = 0; i < subBeat; ++i) {
      td = td.next();
    }

    return td;
  },

  tab: function() {
    return this.model.get('tab');
  },

  render: function() {

    $('.cursor', this.el).removeClass('cursor');

    if (this.cursor) {
      $($('td', this.$('tr')[this.cursor.y])[this.cursor.x]).addClass('cursor');
    }
  },

  width: function() {
    return $('td', this.$('tr')[0]).length;
  },

  height: function() {
    return this.$('tr').length;
  },

  setCursor: function(cursor) {
    this.cursor = cursor;
  },

});

Cursor = function() {
  this.innerPosition = { x: 0, y: 0 };
  this.outerPosition = { x: 0, y: 0 };
};

var TabView = Backbone.View.extend({
  className: "tab",

  initialize: function() {
    this.measureViews = new Backbone.Collection([]);

    this.cursor = new Cursor();

    this.listenTo(this.model.get('measures'), "add", this.addMeasure);

    var self = this;
    this.model.get('measures').each(function(m) { self.addMeasure(m) });
  },

  render: function() {
    this.$el.attr('style', '');

    $('.cursor', this.el).removeClass('cursor');

    var self = this;
    this.measureViews.each(function(mv, idx) {
      //if (self.cursor.outerPosition.x == idx) {
      //  mv.setCursor(self.cursor.innerPosition);
      //} else {
      //  mv.setCursor(null);
      //}

      //mv.render();
    });
  },

  moveLeft: function() {
    this.cursor.innerPosition.x -= 1
  },
  moveRight: function() {
    this.cursor.innerPosition.x += 1
  },
  moveUp: function() {
    this.cursor.innerPosition.y -= 1
  },
  moveDown: function() {
    this.cursor.innerPosition.y += 1
  },
  setFret: function(fret) {
    var mv = this.measureViews.at(this.cursor.outerPosition.x);
    //this.
  },

  addMeasure: function(measure, collection, options) {
    var mv = new MeasureView({
      model: measure,
      el:    $($('#measure-prototype')[0].cloneNode(true)),
    });

    this.measureViews.add(mv);

    this.$el.append(mv.$el);

    this.render();
  },
})

/*
TabView = function(jqObject) {
  this.measureViews = [];
  this.jqObject = jqObject;
  this.cursor   = new Cursor();

  var self = this;
  $(document).on('keypress', function(e) {
    if (e.keyCode == 106) { // j
      self.cursor.innerPosition[1] += 1;
    } else if (e.keyCode == 107) { // k
      self.cursor.innerPosition[1] -= 1;
    } else if (e.keyCode == 108) { // l
      self.cursor.innerPosition[0] += 1;
    } else if (e.keyCode == 104) { // h
      self.cursor.innerPosition[0] -= 1;
    }

    console.log(e.keyCode)  // h
    console.log(self.cursor.innerPosition);

    self.update();
  });
}
TabView.prototype.addMeasure = function(measure) {
  var mv = new MeasureView(measure, $($('#measure-prototype')[0].cloneNode(true)));

  this.measureViews.push(mv);
  this.jqObject[0].appendChild(mv.jqObject[0]);

  this.update();
}
TabView.prototype.update = function() {
  for (var i in this.measureViews) {
    this.measureViews[i].update();

    if (this.cursor.outerPosition[0] == Number(i)) {
      this.measureViews[i].showCursorAt(this.cursor.innerPosition[0], this.cursor.innerPosition[1]);
    }
  }
}
*/

$(function() {
  //var m = new Measure(4);
  // m.numberOfBars();
  //


  //var mv = new MeasureView(m, $('#measure-prototype'));

  var tp = new TabParser();
  var tab = tp.parse(tabString);

  var tabView = new TabView({
    el: $('#tab'),
    model: tab,
  });

  //
  //$(document).on('keypress', function(e) {
  //  if (e.keyCode == 106) { // j
  //    tabView.moveDown();
  //  } else if (e.keyCode == 107) { // k
  //    tabView.moveUp();
  //  } else if (e.keyCode == 108) { // l
  //    tabView.moveRight();
  //  } else if (e.keyCode == 104) { // h
  //    tabView.moveLeft();
  //  }

  //  tabView.render();
  //});
});


