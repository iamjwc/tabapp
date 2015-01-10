var ColumnView = Backbone.View.extend({
  className: "column",

  events: {
  },

  template: _.template("<table><tr><th><th></tr><tbody></tbody></table>"),


  initialize: function() {
    this.$el.attr('style', '');
    this.$el.attr('id', '');
    this.$el.addClass('measure');

    var guideLine = $('<tr></tr>');
    for (var j = 0, m = this.model.get('beats'); j < m; ++j) {
      guideLine.append($('<th class="beat">'+(j+1)+'</th><th>.</th>'));
    }
    this.$('thead').append(guideLine);

    for (var i = 0, n = this.tab().get('numberOfStrings'); i < n; ++i) {
      var line = $('<tr></tr>');

      for (var j = 0, m = this.model.get('beats'); j < m; ++j) {
        line.append($('<td class="beat">&nbsp;</td><td>&nbsp;</td>'));
      }

      this.$('tbody').append(line);
    }

    var self = this;
    this.model.get('notes').each(function(note) {
      var string = self.getStringAtStringIndex(note.get('stringIndex'));
      var fret = self.getFretAtPositionFromString(string, note.get('position'));

      fret.text(note.get('fret'));
      fret.addClass(note.get('modifier'));
      // fret: notes[j].fret,
      // modifier: notes[j].modifier,
      // stringIndex: notes[j].stringIndex,
      // beat: notes[j].beat,
      // subBeat: notes[j].subBeat,
    });
  },

  getStringAtStringIndex: function(stringIndex) {
    return this.$('tr:nth-child('+(stringIndex+1)+')');
  },

  getFretAtPositionFromString: function(string, position) {
    var beat = Math.floor(position / 2);
    var subBeat = position % 2;

    var td = $(string.find('td.beat')[beat-1]);

    for (var i = 0; i < subBeat; ++i) {
      td = td.next();
    }

    return td;
  },

  tab: function() {
    return this.model.get('tab');
  },

  render: function() {
    var html = $(this.template(dict));

    // Append the result to the view's element.
    this.$el.append(html)
  },

  cellAtPosition: function(position) {
    return $($('td', this.$('tr')[position.y])[position.x - 1])
  },

  width: function() {
    return $('th', this.$('thead tr')[0]).length;
  },

  height: function() {
    return this.$('tbody tr').length;
  },

  setCursor: function(cursor) {
    this.cursor = cursor;
  },

});

