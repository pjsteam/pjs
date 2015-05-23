// http://jsperf.com/global-ctx-no-inlined-vs-inlined/2

// HTML setup
<script src="http://rawgit.com/pjsteam/pjs/v1.0.0-beta/dist/p-j-s.min.js"></script>
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

  function contextMapper(pixel, ctx) {
    var masks = ctx.masks;
    var shifts = ctx.shifts;
    var s_r = shifts.r;
    var s_g = shifts.g;
    var s_b = shifts.b;
    var r = (pixel & masks.r) >> s_r;
    var g = (pixel & masks.g) >> s_g;
    var b = (pixel & masks.b) >> s_b;

    var new_r = ctx.colorDistance(ctx.noise(), (r * 0.393) + (g * 0.769) + (b * 0.189), r);
    var new_g = ctx.colorDistance(ctx.noise(), (r * 0.349) + (g * 0.686) + (b * 0.168), g);
    var new_b = ctx.colorDistance(ctx.noise(), (r * 0.272) + (g * 0.534) + (b * 0.131), b);

    return (pixel & 0xFF000000) + (new_b << s_b) + (new_g << s_g) + (new_r << s_r);
  };

  pjs.updateContext({
    contextMapper: contextMapper,
    noise: function () {
        return Math.random() * 0.5 + 0.5;
    },
    colorDistance: function (clamp, scale, dest, src) {
        function clamp (component) {
          return Math.max(Math.min(255, component), 0);
        };
        return clamp(scale * dest + (1 - scale) * src);
    },
    masks: {
      r: 0xFF,
      g: 0xFF00,
      b: 0xFF0000
    },
    shifts: {
      r: 0,
      g: 8,
      b: 16
    }
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

// Test case 2 - map with global not-inlining
wrappedXs.map('contextMapper').seq(function (result) {
  __finish(result);
});