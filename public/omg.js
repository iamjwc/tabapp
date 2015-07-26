

var glide = T("param");
var wave = T("sin", {
  freq: glide,
};

var env = T("adsr", {
  // Attack
  a:0,

  // Delay
  d:500,

  // Sustain
  s:0,

  // Release
  r:50
}, wave);
    
T("interval", {interval: 1000}, function(count){
  
  // Starting frequency
  glide.set({value: 440})


  // if (slideNote || bendNote) {
  // Many options instead of .welTo().
  // sinTo, expTo, cubTo and other exist.
  // Check them by examining 'glide'.
  // glide.welTo(<nextFreq>, <howLongToReach>");
  // glide.welTo(880, "500ms");
  // }

  env.bang().play();
}).start()

//    env.bang().play();

env.plot({target:adsr});

var timeout = T("timeout", {timeout:1500}, function() {
  env.release();
  timeout.stop();
}).start();
