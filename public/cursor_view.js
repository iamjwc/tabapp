var CursorView = Backbone.View.extend({
  events: {
    'click td': 'clickCell',

    'mousedown td': 'mousedownCell',
    'mouseup td':   'mouseupCell',
    'mouseover td': 'mouseoverCell',
  },

  initialize: function() {
    this.tab = $('#tab')

    this.line = 0;
    this.position = { x: 0, y: 0 };

    this.tabView = tabView;
    this.noteSelectorView = noteSelectorView;

    this.renderCursor();
  },

  clearCursor: function() {
    this.line = this.dragStartLine;
    this.position = this.dragStartPosition;

    this.$el.find('.cursor').removeClass('cursor');
  },

  clearSelection: function() {
    this.dragStartCell = null;
    this.dragStartLine = null;
    this.dragStartPosition = null;
    this.selection = null;
    this.renderSelection();
  },

  /* Returns the visual selection as an array of global
   * positions, sorted ascending.
   *
   * selectionAsGlobalRange() => [12,84];
   */
  selectionAsGlobalRange: function() {
    if (!this.selection) {
      return
    }

    this.sortSelectionInPlace();

    var allTables = this.$('table');

    var startColumn = this.$(this.selection[0].cell).parents('table')[0];
    var endColumn = this.$(this.selection[1].cell).parents('table')[0];

    var startIndex = _(allTables).indexOf(startColumn);
    var endIndex  = _(allTables).indexOf(endColumn)+1;

    var columnViews = this.columnViews();

    var globalRangeStart = _(columnViews).
      chain().
      first(startIndex).
      reduce(function(sum, cv) { return sum + cv.width() }, 0).
      value();

    var selectionGlobalWidth = _(columnViews).
      chain().
      last(allTables.length - startIndex).
      first(endIndex - startIndex).
      reduce(function(sum, cv) { return sum + cv.width() }, 0).
      value();

    return [globalRangeStart, globalRangeStart + selectionGlobalWidth];
  },

  mousedownCell: function(e) {
    // Prevents selection
    e.preventDefault();

    var cell = e.target;

    this.dragStartCell = cell;
    this.dragStartLine = this.lineFromTableCell(cell);
    this.dragStartPosition = this.positionFromTableCell(cell);
  },

  mouseoverCell: function(e) {
    if (this.dragStartPosition) {
      this.clearCursor();

      var cell = e.target;

      this.selection = [
        { cell: this.dragStartCell, line: this.dragStartLine, x: this.dragStartPosition.x },
        { cell: cell, line: this.lineFromTableCell(cell), x: this.positionFromTableCell(cell).x },
      ]

      this.renderSelection();
    }
  },

  mouseupCell: function(e) {
    this.dragStartCell = null;
    this.dragStartLine = null;
    this.dragStartPosition = null;
  },

  clickCell: function(e) {
    // We are not dragging on a click.
    this.clearSelection();

    var cell = e.target;

    this.line = this.lineFromTableCell(cell);
    this.position = this.positionFromTableCell(cell);

    // Snap to closest previous note.
    this.position.x -= this.position.x % this.noteSelectorView.selectedNoteWidth();

    this.renderCursor();
  },

  /* lineFromTableCell takes a <td> object and will return which
   * screen line it appears on.
   */
  lineFromTableCell: function(cell) {
    var tableYPositions = _(this.$('table').toArray()).
      chain().
      map(function(t) { return t.offsetTop }).
      sortBy(function(num){ return num; }).
      uniq().
      value();

    
    // Gets the global top coordinate of the cell clicked.
    var cellTop = $(cell).offset().top

    var line = 0;
    while (tableYPositions[line+1] <= cellTop) {
      line += 1;
    }

    return line;
  },

  positionFromTableCell: function(cell) {
    cvs = this.columnViewsByLine()[this.lineFromTableCell(cell)];

    parentCv = _(cvs).find(function(cv) { return cv.$(cell).length > 0; });
    var indexOfCv = cvs.indexOf(parentCv);

    var cellJQueryObject = $(cell);

    var positionX = indexOfCv * Column.SUBDIVISIONS + Number(cellJQueryObject.data('subdivision'));
    var positionY = cellJQueryObject.parent('tr').data('string-index');

    return { y: positionY, x: positionX };
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

  renderCursor: function() {
    this.clearSelection();

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

  renderSelection: function() {
    this.$el.find('.selection').removeClass('selection');

    if (!this.selection) {
      return;
    }

    this.sortSelectionInPlace();

    var allTables = this.$('table');

    var startColumn = this.$(this.selection[0].cell).parents('table')[0];
    var endColumn = this.$(this.selection[1].cell).parents('table')[0];

    var startIndex = _(allTables).indexOf(startColumn);
    var endIndex  = _(allTables).indexOf(endColumn)+1;

    var selectedTables = _(allTables).
      chain().
      last(allTables.length - startIndex).
      first(endIndex - startIndex).
      value();

    this.$(selectedTables).addClass('selection');
  },

  /* Sorts the selection in place so that the selection
   * coordinates are always in order.
   */
  sortSelectionInPlace: function() {
    if (!this.selection) {
      return;
    }

    if (this.selection[0].line < this.selection[1].line) {
      // We're sorted.
      return;
    }

    if (this.selection[0].line > this.selection[1].line) {
      var tmp = this.selection[0];
      this.selection[0] = this.selection[1];
      this.selection[1] = tmp;

      // We're sorted.
      return;
    }

    if (this.selection[0].x > this.selection[1].x) {
      var tmp = this.selection[0];
      this.selection[0] = this.selection[1];
      this.selection[1] = tmp;

      // We're sorted.
      return;
    }
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

  columnViews: function() {
    return _.flatten(this.tabView.measureViews.map(function(mv) { return mv.columnViews.models }));
  },

  /* Each line will have a different upper Y position value.
   * Gets an array of column views grouped by line number.
   */
  columnViewsByLine: function() {
    var groupedCvs = [];
    var currentY     = null;

    _.each(this.columnViews(), function(cv) {
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
    this.renderCursor();
  },
  moveRight: function() {
    this.position.x += this.noteSelectorView.selectedNoteWidth();
    this.renderCursor();
  },
  moveUp: function() {
    this.position.y -= 1;
    this.renderCursor();
  },
  moveDown: function() {
    this.position.y += 1;
    this.renderCursor();
  },
})
