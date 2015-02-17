var PlayerView = Backbone.View.extend({
  el: '#player',

  events: {
    'click .start': 'start',
    'click .stop': 'stop',
    'click .loop': 'loop',
  },

  initialize: function() {
    this.player = player;

    var self = this;

    player.on('player:at', function(args) {
      self.$('progress').attr('max', args.totalLength);
      self.$('progress').attr('value', args.globalPosition);
    });

    player.on('player:stop', function(args) {
      self.$('progress').attr('value', 0);
    });

    this.render();
  },

  start: function() {
    player.play();
  },

  stop: function() {
    player.stop();
  },

  loop: function() {
    player.loop();
    this.render();
  },

  render: function() {
    if (player.get('shouldLoop')) {
      this.$('.loop').addClass('selected');
    } else {
      this.$('.loop').removeClass('selected');
    }
  },
});
