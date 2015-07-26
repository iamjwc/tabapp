var Measure = Backbone.Model.extend({
  initialize: function() {
    this.set('columns', new Backbone.Collection([], {
      model: Column
    }));
  },
});
