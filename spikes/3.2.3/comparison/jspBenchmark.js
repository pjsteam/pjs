// 

// HTML preparation
<script src="https://rawgit.com/pjsteam/pjs/v0.2.0/dist/p-j-s.min.js"></script>
<script>
  var pjs = require('p-j-s');
  pjs.init();

  var generateElements = function (total) {
    var typed = new Uint32Array(total);
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

  function predicate(pixel) {
    var r = pixel & 0xFF;
    var g = (pixel & 0xFF00) >> 8;
    var b = (pixel & 0xFF0000) >> 16;

    var component_r = r * r * 0.241;
    var component_g = g * g * 0.691;
    var component_b = b * b * 0.068;

    var brightness = Math.sqrt(component_r + component_g + component_b);

    return brightness > 130;
  };

  function serialFilter(pixels, l) {
    var result = new Uint32Array(l);
    var newLength = 0;
    for (var i = 0; i < l; i++) {
      var pixel = pixels[i];
      var r = pixel & 0xFF;
      var g = (pixel & 0xFF00) >> 8;
      var b = (pixel & 0xFF0000) >> 16;

      var component_r = r * r * 0.241;
      var component_g = g * g * 0.691;
      var component_b = b * b * 0.068;

      var brightness = Math.sqrt(component_r + component_g + component_b);

      if (brightness > 130) {
        result[newLength++] = pixel;
      }
    }
    return new Uint32Array(result).subarray(0, newLength);
  };

  function runSerial(xs) {
    var r = serialFilter(xs, xs.length);
    if (0 === r.length) {
      console.log('ups serial');
    }
  };

  function runPjs(wrappedXs) {
    wrappedXs.filter(predicate, function (r) {
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