var ColumnView = Backbone.View.extend({
  className: "column",

  events: {
  },

  initialize: function() {
    this.render();



                    //document.getElementById('columnTemplate').cloneNode(true)

    /*
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
    */
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
    var column = $(document.getElementById('columnTemplate').innerHTML);
    var stringTemplate = document.getElementById('stringTemplate').innerHTML;

    for (var i = 0, n = tab.get('numberOfStrings'); i < n; ++i) {
      $('tbody', column).append($(stringTemplate));
    }

    this.setElement(column);

    var self = this;

    this.model.get('notes').each(function(note) {
      var td = self.$('tbody tr:nth-child(' + (note.get('stringIndex')+1) + ') > .subdivision'+note.get('localPosition'))
      td.addClass(note.get('modifier'));
      td.text(note.get('fret'));
    });
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

}, {
  MODES_TO_DATA: {
    "trip8th": [0,4,8],
    "8th-8th": [0,6],
    "8th-16th": [0,6,9],
    "16th-8th": [0,3,6],
    "16th-16th": [0,3,6,9],
    "trip16th-16th": [0,2,4,6,9],
    "16th-trip16th": [0,6,8,10],
    "trip16th-trip16th": [0,2,4,6,8,10],
  },
});

