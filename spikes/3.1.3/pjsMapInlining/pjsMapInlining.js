// http://jsperf.com/pjs-map-inlining/2

// HTML setup
<script src="https://rawgit.com/pjsteam/pjs/v0.1.1/dist/p-j-s.min.js"></script>
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

  var xs = generateElements(1000000); // 1.000.000

  var wrappedXs = pjs(xs);

  function notInlinedMapper(pixel) {
    function noise() {
        return Math.random() * 0.5 + 0.5;
    };

    function clamp(component) {
        return Math.max(Math.min(255, component), 0);
    }

    function colorDistance(scale, dest, src) {
        return clamp(scale * dest + (1 - scale) * src);
    };

    var r = pixel & 0xFF;
    var g = (pixel & 0xFF00) >> 8;
    var b = (pixel & 0xFF0000) >> 16;

    var new_r = colorDistance(noise(), (r * 0.393) + (g * 0.769) + (b * 0.189), r);
    var new_g = colorDistance(noise(), (r * 0.349) + (g * 0.686) + (b * 0.168), g);
    var new_b = colorDistance(noise(), (r * 0.272) + (g * 0.534) + (b * 0.131), b);

    return (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
  };

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

    return (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
  };
</script>

// Test case 1 - Not inlined map
wrappedXs.map(notInlinedMapper, function (result) {
  if (!result) {
    console.log('error');
  }
  deferred.resolve();
});

// Test case 2 - Inlined map
wrappedXs.map(inlinedMapper, function (result) {
  if (!result) {
    console.log('error');
  }
  deferred.resolve();
});