var PlayerView = Backbone.View.extend({
  el: '#player',

  events: {
    'click .start': 'start',
    'click .stop': 'stop',
  },

  initialize: function() {
  },
});
