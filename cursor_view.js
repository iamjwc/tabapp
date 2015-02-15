var CursorView = Backbone.View.extend({
  initialize: function() {
    this.tab = $('#tab')
    this.position = { x: 0, y: 0 };

    this.tabView = tabView;

    this.render();
  },

  render: function() {
    this.$el.find('.cursor').removeClass('cursor');

    var cell = this.cellAtPosition(this.position);
    cell.addClass('cursor');
  },

  /* Finds the width of a line on the screen by adding
   * up all of the widths of the columnViews found on
   * a given line.
   */
  widthOfLine: function(i) {
    var line = this.columnViewsByLine()[i];

    return _.reduce(line, function(sum, cv) {
      return sum += cv.width();
    }, 0);
  },

  heightOfLine: function() {
    return this.columnViewsByLine()[0][0].height();
  },

  numberOfLines: function() {
    return this.columnViewsByLine().length;
  },

  cellAtPosition: function(position) {
    var line = Math.floor(position.y / this.heightOfLine());
    console.log(line)

    var stringIndex = (position.y % this.heightOfLine());

    var cvs = this.columnViewsByLine()[line];

    var cv;
    var x = position.x;
    for (var i in cvs) {
      if (x > cvs[i].width()) {
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
    this.position.x -= 1;
    this.render();
  },
  moveRight: function() {
    this.position.x += 1;
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
