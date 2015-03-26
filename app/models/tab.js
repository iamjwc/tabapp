var Tab = Backbone.Model.extend({
  defaults: {
    capo: 0
  },

  initialize: function() {
    this.set('measures', new Backbone.Collection([], {
      model: Measure,
    }));
  },

  // Returns the total number of subdivisions in the entire tab.
  totalLength: function() {
    return tab.get('measures').reduce(function(sum, measure) {
      return sum + measure.get('columns').length * Column.SUBDIVISIONS;
    }, 0);
  },

  /* Takes a global "subdivision position" and returns
   * the measure, column and local position.
   */
  globalPositionToLocalPosition: function(position) {
    var localPosition = position % Column.SUBDIVISIONS;
    var globalColumnPosition = Math.floor(position / Column.SUBDIVISIONS);
    var measureIndex = 0;

    var currentMeasure = tab.get('measures').at(measureIndex);
    while (currentMeasure && globalColumnPosition >= currentMeasure.get('columns').length) {
      globalColumnPosition -= currentMeasure.get('columns').length;

      measureIndex += 1;
      currentMeasure = tab.get('measures').at(measureIndex);
    }

    return {
      localPosition: localPosition,
      measureIndex: measureIndex,
      columnIndex: globalColumnPosition,
    };
  }
});
