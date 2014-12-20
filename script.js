
Measure = function(barCount) {
  this.barCount = barCount;
}
Measure.prototype.numberOfBars = function() {
  alert(this.barCount);
}

MeasureView = function(measure, jqObject) {
  this.measure = measure;
  this.jqObject = jqObject;
}

MeasureView.prototype.update = function() {
  this.jqObject.attr('style', '');

  $('.cursor', this.jqObject).removeClass('cursor');
}

MeasureView.prototype.width = function() {
  return $('td', $('tr', this.jqObject)[0]).length;
}
MeasureView.prototype.height = function() {
  return $('tr', this.jqObject).length;
}

MeasureView.prototype.showCursorAt = function(x,y) {
  $($('td', $('tr', this.jqObject)[y])[x]).addClass('cursor')
}

Cursor = function() {
  this.innerPosition = [0,0];
  this.outerPosition = [0,0];
};

TabView = function(jqObject) {
  this.measureViews = [];
  this.jqObject = jqObject;
  this.cursor   = new Cursor();

  var self = this;
  $(document).on('keypress', function(e) {
    if (e.keyCode == 106) { // j
      self.cursor.innerPosition[1] += 1;
    } else if (e.keyCode == 107) { // k
      self.cursor.innerPosition[1] -= 1;
    } else if (e.keyCode == 108) { // l
      self.cursor.innerPosition[0] += 1;
    } else if (e.keyCode == 104) { // h
      self.cursor.innerPosition[0] -= 1;
    }

    console.log(e.keyCode)  // h
    console.log(self.cursor.innerPosition);

    self.update();
  });
}
TabView.prototype.addMeasure = function(measure) {
  var mv = new MeasureView(measure, $($('#measure-prototype')[0].cloneNode(true)));

  this.measureViews.push(mv);
  this.jqObject[0].appendChild(mv.jqObject[0]);

  this.update();
}
TabView.prototype.update = function() {
  for (var i in this.measureViews) {
    this.measureViews[i].update();

    if (this.cursor.outerPosition[0] == Number(i)) {
      this.measureViews[i].showCursorAt(this.cursor.innerPosition[0], this.cursor.innerPosition[1]);
    }
  }
}

$(function() {
  var m = new Measure(4);
  // m.numberOfBars();
  //

  //var mv = new MeasureView(m, $('#measure-prototype'));
  theTab = new TabView($('#tab'));
  theTab.addMeasure(m)
});


