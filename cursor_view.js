var CursorView = Backbone.View.extend({
  initialize: function() {
    this.tab = $('#tab')

    this.line = 0;
    this.position = { x: 0, y: 0 };

    this.tabView = tabView;
    this.noteSelectorView = noteSelectorView;

    this.render();
  },

  updateLine: function() {
    if (this.position.y < 0) {
      this.line -= 1;
      this.position.y = this.heightOfLine()-1;
    } else if (this.position.y >= this.heightOfLine()) {
      this.line += 1;
      this.position.y = 0;
    }
  },

  updateX: function() {
    if (this.position.x >= this.widthOfLine(this.line)) {
      this.position.x = this.position.x - this.widthOfLine(this.line);
      this.line += 1;
    } else if (this.position.x < 0 && this.line > 0) {
      this.line -= 1;
      this.position.x = this.widthOfLine(this.line) + this.position.x;
    }
  },

  setFret: function(val) {
  },

  render: function() {
    this.updateX();
    this.updateLine();

    this.$el.find('.cursor').removeClass('cursor');

    var cell = this.cellAtPosition(this.line, this.position);
    cell.addClass('cursor');
  },

  /* Finds the width of a line on the screen by adding
   * up all of the widths of the columnViews found on
   * a given line.
   */
  widthOfLine: function(line) {
    var cvs = this.columnViewsByLine()[line];

    return _.reduce(cvs, function(sum, cv) {
      return sum += cv.width();
    }, 0);
  },

  heightOfLine: function() {
    return this.columnViewsByLine()[0][0].height();
  },

  numberOfLines: function() {
    return this.columnViewsByLine().length;
  },

  cellAtPosition: function(line, position) {
    var stringIndex = (position.y % this.heightOfLine());

    var cvs = this.columnViewsByLine()[line];

    var cv;
    var x = position.x;
    for (var i in cvs) {
      if (x >= cvs[i].width()) {
        x -= cvs[i].width();
      } else {
        cv = cvs[i];
        break;
      }
    }

    return cv.cellAtPosition(new Position(x, stringIndex));
  },

  /* Each line will have a different upper Y position value.
   * Gets an array of column views grouped by line number.
   */
  columnViewsByLine: function() {
    var groupedCvs = [];
    var currentY     = null;

    var columnViews = this.tabView.measureViews.map(function(mv) { return mv.columnViews.models });
    columnViews = _.flatten(columnViews);

    _.each(columnViews, function(cv) {
      var cvY = cv.el.offsetTop;

      if (currentY == cvY) {
        groupedCvs[groupedCvs.length-1].push(cv);
      } else {
        groupedCvs.push([cv]);
      }

      currentY = cvY;
    });

    return groupedCvs;
  },

  moveLeft: function() {
    this.position.x -= this.noteSelectorView.selectedNoteWidth();
    this.render();
  },
  moveRight: function() {
    this.position.x += this.noteSelectorView.selectedNoteWidth();
    this.render();
  },
  moveUp: function() {
    this.position.y -= 1;
    this.render();
  },
  moveDown: function() {
    this.position.y += 1;
    this.render();
  },
})
