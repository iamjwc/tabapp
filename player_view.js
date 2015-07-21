var PlayerView = Backbone.View.extend({
  el: '#player',

  events: {
    'click .start': 'start',
    'click .stop': 'stop',
    'click .loop': 'loop',
    'input input.tempo': 'updateTempo',
    'input input.transposition': 'updateTransposition',
  },

  initialize: function() {
    this.player = player;

    var self = this;

    player.on('player:at', function(args) {
      if (args.globalPosition % 2 == 0) {
        self.$('progress').attr('max', args.totalLength);
        self.$('progress').attr('value', args.globalPosition);
      }
    });

    player.on('player:stop', function(args) {
      self.$('progress').attr('value', 0);
    });

    this.render();
  },

  updateTempo: function() {
    var tempo = this.$('input.tempo').val();
    this.player.set('bpm', tempo);

    this.render();
  },

  updateTransposition: function() {
    var transposition = this.$('input.transposition').val();
    tab.set('transposition', transposition);

    this.render();
  },

  start: function() {
    this.$el.addClass('playing');
    var range = cursorView.selectionAsGlobalRange();

    player.play(range);
  },

  stop: function() {
    this.$el.removeClass('playing')
    player.stop();
  },

  loop: function() {
    player.loop();
    this.render();
  },

  render: function() {
    this.$('.bpm-label').text(this.player.get('bpm') + " BPM");
    this.$('.transposition-label').text("Transposition " + tab.get('transposition'));

    if (player.get('shouldLoop')) {
      this.$('.loop').addClass('selected');
    } else {
      this.$('.loop').removeClass('selected');
    }
  },
});
