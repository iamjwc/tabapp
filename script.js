/* Columns are a 1-quarter-note grouping.
 *
 * Triplets can be shown by simply having 3 eighth
 * notes per column.
 *
 * Legend
 *   
 *   +  quarter
 *   -  eighth
 *   .  sixtenth
 *   
 *
 * Hyphen:  -
 * En dash: –
 * Em dash: —
 */

var tabString = [
  "|: + - + - + - + - | + - + . - . + - - + - :|",
  "|:-----------------|-----------------------:|",
  "|:-----------------|-----------------------:|",
  "|:-----------------|-0-----------3p2p0-----:|",
  "|:-----------0-2p0-|-------------------2p0-:|",
  "|:-----0-1/2-------|-----------------------:|",
  "|:-3---------------|-----------------------:|",
  "",
  "| + - + - + - + - + - |",
  "|---------------------|",
  "|---------------------|",
  "|-0-------------------|",
  "|---------------------|",
  "|---------------------|",
  "|---------------------|",
  "",
  "| +  - +  -  +  -  +  -  | +   - + - + - + - |",
  "|------------------------|-------3-2-1-------|",
  "|------------------------|-------------3-2-1-|",
  "|------------------------|<12>---------------|",
  "|---------------12-14p12-|-------------------|",
  "|------12-13/14----------|-------------------|",
  "|-15---------------------|-------------------|",
  "",
  "| + - + - | + - + - |",
  "|---------|---------|",
  "|---------|---------|",
  "|-0-2-3-4-|/5-------|",
  "|---------|---------|",
  "|---------|---------|",
  "|---------|---------|",
].join("\n");


$(function() {
  //var m = new Measure(4);
  // m.numberOfBars();
  //


  //var mv = new MeasureView(m, $('#measure-prototype'));

  var tp = new TabParser();
  tab = tp.parse(tabString);
  player = new Player;

  tabView = new TabView({
    el: $('#tab'),
    model: tab,
    player: player
  });


  $('#start').on('click', function() {
    player.play();
  });

  $('#stop').on('click', function() {
    player.stop();
  });
  
  $(document).on('keypress', function(e) {
    if (e.keyCode == 106) { // j
      tabView.moveDown();
    } else if (e.keyCode == 107) { // k
      tabView.moveUp();
    } else if (e.keyCode == 108) { // l
      tabView.moveRight();
    } else if (e.keyCode == 104) { // h
      tabView.moveLeft();
    }

    tabView.render();
  });
});


