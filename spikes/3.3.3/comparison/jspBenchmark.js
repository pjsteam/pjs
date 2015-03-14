// http://jsperf.com/pjs-reduce-vs-serial

// HTML preparation
<script src="https://rawgit.com/pjsteam/pjs/v0.2.1/dist/p-j-s.min.js"></script>
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

  function reducer(prev, pixel) {
    var r = pixel & 0xFF;
    var g = (pixel & 0xFF00) >> 8;
    var b = (pixel & 0xFF0000) >> 16;

    var component_r = r * r * 0.241;
    var component_g = g * g * 0.691;
    var component_b = b * b * 0.068;

    return prev + Math.sqrt(component_r + component_g + component_b);
  };

  function serialReducer(pixels, seed, l) {
    var acum = seed;
    var newLength = 0;
    for (var i = 0; i < l; i++) {
      var pixel = pixels[i];
      var r = pixel & 0xFF;
      var g = (pixel & 0xFF00) >> 8;
      var b = (pixel & 0xFF0000) >> 16;

      var component_r = r * r * 0.241;
      var component_g = g * g * 0.691;
      var component_b = b * b * 0.068;

      acum += Math.sqrt(component_r + component_g + component_b);
    }
    return acum;
  };

  function runSerial(xs) {
    var r = serialReducer(xs, 0, xs.length);
    var avg = r / xs.length;
    if (avg === 0) {
      console.log('ups serial');
    }
  };

  function runPjs(wrappedXs) {
    wrappedXs.reduce(reducer, 0, 0, function (r) {
      var result = r / wrappedXs.length;
      __finish();
    });
  };
</script>

// Javascript setup
__finish = function () {
  deferred.resolve();
};

// Test Case - serial reduce 100
runSerial(xs100);

// Test Case - pjs reduce 100
runPjs(wrappedXs100);

// Test Case - serial reduce 1,000
runSerial(xs1000);

// Test Case - pjs reduce 1,000
runPjs(wrappedXs1000);

// Test Case - serial reduce 10,000
runSerial(xs10000);

// Test Case - pjs reduce 10,000
runPjs(wrappedXs10000);

// Test Case - serial reduce 100,000
runSerial(xs100000);

// Test Case - pjs reduce 100,000
runPjs(wrappedXs100000);

// Test Case - serial reduce 1,000,000
runSerial(xs1000000);

// Test Case - pjs reduce 1,000,000
runPjs(wrappedXs1000000);