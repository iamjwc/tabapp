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
