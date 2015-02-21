/* A 'beat' with N subdivisions.
 *
 * Graphically, here are the subdivisions:
 * 
 * 12 % 12 == 0  |+           |  1 quarter note
 * 12 % 6  == 0  |+     -     |  2 eighth
 * 12 % 4  == 0  |+   -   -   |  3 eighth note triplets
 * 12 % 3  == 0  |+  .  -  .  |  4 sixteenth notes
 * 12 % 2  == 0  |+ . . - . . |  6 sixteenth note triplets
 *
 * Width: 12
 *
 */
 Column = Backbone.Model.extend({
  defaults: {
  },

  validate: function(attributes) {
  },

  initialize: function() {
    this.set('notes', new Backbone.Collection([], {
      model: Note
    }));
  },

  notesAtSubdivision: function(i) {
    return this.get('notes').where({
      localPosition: i
    });
  },
}, {
  SUBDIVISIONS: 12,
});

