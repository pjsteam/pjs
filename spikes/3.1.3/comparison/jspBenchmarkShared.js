// http://jsperf.com/pjs-map-vs-serial/9

// HTML preparation
<script src="http://rawgit.com/pjsteam/pjs/v1.0.0-beta/dist/p-j-s.min.js"></script>
<script>
  var pjs = require('p-j-s');
  pjs.init({ maxWorkers: 4});

  var generateElements = function (total) {
    var typed = new SharedUint32Array(total);
    for (var i = total; i > 0; i--){
      typed[i - 1] = 0xdddddddd;
    }
    return typed;
  };
  var xs100 = generateElements(100);
  var wrappedXs100 = pjs(xs100);
  var xs1000 = generateElements(1000);
  var wrappedXs1000 = pjs(xs1000);
  var xs10000 = generateElements(10000);
  var wrappedXs10000 = pjs(xs10000);
  var xs100000 = generateElements(100000);
  var wrappedXs100000 = pjs(xs100000);
  var xs1000000 = generateElements(1000000);
  var wrappedXs1000000 = pjs(xs1000000);

  function mapper(pixel) {
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

  function serialMap(pixels, l) {
    var result = new Uint32Array(l);
    for (var i = 0; i < l; i++) {
      var pixel = pixels[i];
      var r = pixel & 0xFF;
      var g = (pixel & 0xFF00) >> 8;
      var b = (pixel & 0xFF0000) >> 16;

      var noise_r = Math.random() * 0.5 + 0.5;
      var noise_g = Math.random() * 0.5 + 0.5;
      var noise_b = Math.random() * 0.5 + 0.5;

      var new_r = Math.max(Math.min(255, noise_r * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noise_r) * r), 0);
      var new_g = Math.max(Math.min(255, noise_g * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noise_g) * g), 0);
      var new_b = Math.max(Math.min(255, noise_b * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noise_b) * b), 0);

      result[i] = (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
    }
    return result;
  };

  function runSerial(xs) {
    var r = serialMap(xs, xs.length);
    if (0 === r.length) {
      console.log('ups serial');
    }
  };

  function runPjs(wrappedXs) {
    wrappedXs.map(mapper).seq(function (err, r) {
      __finish();
    });
  };
</script>

// Javascript setup
__finish = function () {
  deferred.resolve();
};

// Test Case - serial map 100
runSerial(xs100);

// Test Case - pjs map 100
runPjs(wrappedXs100);

// Test Case - serial map 1,000
runSerial(xs1000);

// Test Case - pjs map 1,000
runPjs(wrappedXs1000);

// Test Case - serial map 10,000
runSerial(xs10000);

// Test Case - pjs map 10,000
runPjs(wrappedXs10000);

// Test Case - serial map 100,000
runSerial(xs100000);

// Test Case - pjs map 100,000
runPjs(wrappedXs100000);

// Test Case - serial map 1,000,000
runSerial(xs1000000);

// Test Case - pjs map 1,000,000
runPjs(wrappedXs1000000);