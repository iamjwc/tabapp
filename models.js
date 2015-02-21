var Note = Backbone.Model.extend({
  defaults: {
    fret: null,
    modifier: null,

    // O-based string. For standard guitar tuning, E = 0, B = 1, G = 2, etc.
    stringIndex: null,

    // Position local to the column where the note should appear.
    // I'm not a fan of this design decision, but its easy and I'm
    // not really sure how to do it in a better way with Backbone.
    localPosition: null,

    /* Width is the amount of subdivisions the note should be
     * played for. This will be constant for now.
     */
    width: 4,
  },

  validate: function(attributes) {
    // Fret Validations
    if (!attributes.fret) {
      return "must specify fret";
    } else {
      if (attributes.fret < 0 || attributes.fret > 25) {
        return "must be valid fret"
      }
    }

    if (attributes.localPosition == null) {
      return "must specify localPosition";
    } else if (attributes.localPosition < 0 || attributes.localPosition >= Column.SUBDIVISIONS) {
      return "invalid localPosition";
    }
  },

  isHarmonic: function() {
    return this.get('modifier') == 'harmonic';
  },
});
