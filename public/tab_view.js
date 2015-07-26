var TabView = Backbone.View.extend({
  className: "tab",

  initialize: function() {
    this.measureViews = new Backbone.Collection([], { model: MeasureView });

    this.listenTo(this.model.get('measures'), "add", this.addMeasure);

    var self = this;
    this.model.get('measures').each(function(m) { self.addMeasure(m) });

    this.player = player;
    player.on('player:at', function(args) {
      if (args.globalPosition % 2 == 0) {
        $('.playHead').removeClass('playHead');

        var mv = self.measureViews.at(args.measureIndex);
        var cv = mv.columnViews.at(args.columnIndex);

        cv.$('.subdivision' + args.localPosition).addClass('playHead');
      }
    });

    player.on('player:stop', function(args) {
      $('.playHead').removeClass('playHead');
    });
  },

  render: function() {
    this.$el.attr('style', '');

    if (this.model.get('title')) {
      this.$('.title')
        .show()
        .text(this.model.get('title'));
    }

    if (this.model.get('artist')) {
      this.$('.artist')
        .show()
        .text(this.model.get('artist'));
    }
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
