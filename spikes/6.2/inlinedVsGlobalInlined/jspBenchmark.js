// http://jsperf.com/global-ctx-inlined-func

// HTML setup
<script src="http://rawgit.com/pjsteam/pjs/v0.5.2/dist/p-j-s.min.js"></script>
<script>
  var pjs = require('p-j-s');
  pjs.init();

  var generateElements = function (total) {
    var typed = new Uint32Array(total);
    for (var i = total; i > 0; i--){
      typed[i - 1] = i;
    }
    return typed;
  };

  var xs = generateElements(50000);

  var wrappedXs = pjs(xs);

  function inlinedMapper(pixel) {
    var r = pixel & 0xFF;
    var g = (pixel & 0xFF00) >> 8;
    var b = (pixel & 0xFF0000) >> 16;
    var noise_r = Math.random() * 0.5 + 0.5;
    var noise_g = Math.random() * 0.5 + 0.5;
    var noise_b = Math.random() * 0.5 + 0.5;

    var new_r = Math.max(Math.min(255, noise_r * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noise_r) * r), 0);
    var new_g = Math.max(Math.min(255, noise_g * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noise_g) * g), 0);
    var new_b = Math.max(Math.min(255, noise_b * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noise_b) * b), 0);

    return (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + new_r;
  };

  pjs.updateContext({
    inlinedMapper: inlinedMapper
  });
</script>

// JavaScript Setup
var __finish = function (result) {
  if (!result) {
    console.log('error');
  }
  deferred.resolve();
};

// Test case 1 - map with inlining
wrappedXs.map(inlinedMapper).seq(function (result) {
  __finish(result);
});

// Test case 2 - map with global inlining
  wrappedXs.map('inlinedMapper').seq(function (result) {
    __finish(result);
  });