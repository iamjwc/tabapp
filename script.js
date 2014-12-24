

var Tab = Backbone.Collection.extend({
  model: Measure,
});

var Note = Backbone.Model.extend({
});

var Measure = Backbone.Model.extend({
  initialize: function() {
    this.notes = [
      new Note({ fret: 3, string: 0 })
    ]
  },
});

var tabString = [
  "/:-+---+---+---+---/-+---+---[+----]-+---:/",
  "|:-----------------|---------------------:|",
  "|:-----------------|---------------------:|",
  "|:-----------------|-0--------3p2p0------:|",
  "|:-----------0-2p0-|-----------------2p0-:|",
  "|:-----0-1/2-------|---------------------:|",
  "|:-3---------------|---------------------:|",
  "",
  "/-+---+---+---+---+---/",
  "|---------------------|",
  "|---------------------|",
  "|-0-------------------|",
  "|---------------------|",
  "|---------------------|",
  "|---------------------|",
  "",
  "/-+----+-----+-----+-----/-+----+---+---+---/",
  "|------------------------|------------------|",
  "|------------------------|------------------|",
  "|------------------------|-(12)-------------|",
  "|---------------12-14p12-|------------------|",
  "|------12-13/14----------|------------------|",
  "|-15---------------------|------------------|",
  "",
  "/-+---+---/-+---+---/",
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

  beatsInMeasure: function(measureString) {
    return measureString.split("\n")[0].split("+").length - 1;
  },

  parse: function(tabObject, tabString) {
    var linearTab = this.linearizeTab(tabString);
    var guideLine = linearTab.split("\n")[0];

    console.log("\n"+linearTab);

    var measures = this.splitTabIntoMeasures(linearTab);
    for (var i in measures) {
      console.log("\n" + measures[i]);
      console.log("\n" + measures[i].length);
      console.log("\nBeats in measure: " + this.beatsInMeasure(measures[i]));
    }

    var currentMeasure = null;
    var numberOfBeatsInMeasure = 0;

    for (var i = 0, n = guideLine.length; i < n; ++i) {
      if (guideLine[i] == "/") {
        if (guideLine[i-1] == ":") {
          currentMeasure.set('repeatEnd', true);
        }

        currentMeasure = new Measure({});
        numberOfBeatsInMeasure = 0;
        tabObject.add(currentMeasure);

        if (guideLine[i+1] == ":") {
          currentMeasure.set('repeatStart', true);
        }
      } else if (guideLine[i] == "+") {
        numberOfBeatsInMeasure += 1;
      }
    }
    
    //var strings = tabString.split("\n");

    return tabObject;
  },



  /* Takes the tab as an array of strings and pops a single
   * measure off as an array of strings.
   */
  popMeasure: function(numberOfStrings, strings) {
    var guide = strings[0].match(new RegExp("(/[^/]+)/"))[1];
    var measureLengthInChars = guide;

    for (var i = 0, n = numberOfStrings+1; i < n; ++i) {

    }
  },
});


var MeasureView = Backbone.View.extend({
  className: "measure",

  events: {
  },

  initialize: function() {
    this.listenTo(this.model, "change", this.render);
  },

  render: function() {
    this.$el.attr('style', '');

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
    this.measureViews = new Backbone.Collection([], {
      model: MeasureView
    });

    this.cursor = new Cursor();

    this.listenTo(this.model, "add", this.addMeasure);
  },

  render: function() {
    this.$el.attr('style', '');

    $('.cursor', this.el).removeClass('cursor');

    var self = this;
    this.measureViews.each(function(mv, idx) {
      if (self.cursor.outerPosition.x == idx) {
        mv.setCursor(self.cursor.innerPosition);
      } else {
        mv.setCursor(null);
      }

      mv.render();
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
      el:   $($('#measure-prototype')[0].cloneNode(true)),
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

  var tab = new Tab();
  var tabView = new TabView({
    el: $('#tab'),
    model: tab,
  });

  var tp = new TabParser();
  tp.parse(tab, tabString);

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


