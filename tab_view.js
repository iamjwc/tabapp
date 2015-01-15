var TabView = Backbone.View.extend({
  className: "tab",

  initialize: function() {
    this.measureViews = new Backbone.Collection([], { model: MeasureView });

    this.cursor = new Position(0,0);

    this.listenTo(this.model.get('measures'), "add", this.addMeasure);

    var self = this;
    this.model.get('measures').each(function(m) { self.addMeasure(m) });
  },

  render: function() {
    this.$el.attr('style', '');

    // Remove current cursor and replace it.
    //$('.cursor', this.el).removeClass('cursor');
    //this.cellAtPosition(this.cursor).addClass('cursor');

    //var self = this;
    //this.measureViews.each(function(mv, idx) {
    //  if (self.cursor.outerPosition.x == idx) {
    //    mv.setCursor(self.cursor.innerPosition);
    //  } else {
    //    mv.setCursor(null);
    //  }

    //  mv.render();
    //});
  },

  cellAtPosition: function(position) {
    var line = Math.floor(position.y / this.heightOfLine());
    console.log(line)

    var string = (position.y % this.heightOfLine());

    var mvs = this.measureViewsByLine()[line - 1];

    var mv;
    var x = position.x;
    for (var i in mvs) {
      if (x > mvs[i].width()) {
        x -= mvs[i].width();
      } else {
        mv = mvs[i];
        break;
      }
    }

    return mv.cellAtPosition(new Position(x, string));
  },

  numberOfLines: function() {
    return this.measureViewsByLine().length;
  },

  /* Each line will have a different upper Y position value.
   * Gets an array of measure views grouped by line number.
   */
  measureViewsByLine: function() {
    var groupedMvs = [];
    var currentY     = null;

    this.measureViews.each(function(mv) {
      var mvY = mv.el.offsetTop;

      if (currentY == mvY) {
        groupedMvs[groupedMvs.length-1].push(mv);
      } else {
        groupedMvs.push([mv]);
      }

      currentY = mvY;
    });

    return groupedMvs;
  },

  /* Finds the width of a line on the screen by adding
   * up all of the widths of the measureViews found on
   * a given line.
   */
  widthOfLine: function(i) {
    var line = this.measureViewsByLine()[i];

    return _.reduce(line, function(sum, mv) {
      return sum += mv.width();
    }, 0);
  },

  heightOfLine: function() {
    return this.measureViewsByLine()[0][0].height();
  },

  moveLeft: function() {
    this.cursor.x -= 1;
    this.render();
  },
  moveRight: function() {
    this.cursor.x += 1;
    this.render();
  },
  moveUp: function() {
    this.cursor.y -= 1;
    this.render();
  },
  moveDown: function() {
    this.cursor.y += 1;
    this.render();
  },
  setFret: function(fret) {
    var mv = this.measureViews.at(this.cursor.outerPosition.x);
    //this.
  },

  addMeasure: function(measure, collection, options) {
    this.measureViews.add({
      model: measure,
    });

    var mv = this.measureViews.last();

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
