var NoteSelectorView = Backbone.View.extend({
  el: '#note-selector',

  events: {
    'click li': 'selectNote'
  },

  initialize: function() {
  },

  selectNote: function(e) {
    this.$('li').removeClass('selected')
    this.$(e.currentTarget).addClass('selected')

    console.log(e);
  },

  selectNextNote: function() {
    var nextSibling = this.selected().next()

    if (!nextSibling.length) {
      nextSibling = this.$('li:first-child');
    }

    this.$('li').removeClass('selected')
    this.$(nextSibling).addClass('selected')
  },

  selectPrevNote: function() {
    var nextSibling = this.selected().prev()

    if (!nextSibling.length) {
      nextSibling = this.$('li:last-child');
    }

    this.$('li').removeClass('selected')
    this.$(nextSibling).addClass('selected')
  },

  selectedNoteWidth: function() {
    return this.selected().data('width');
  },

  selected: function() {
    return this.$el.find('.selected');
  }
})
