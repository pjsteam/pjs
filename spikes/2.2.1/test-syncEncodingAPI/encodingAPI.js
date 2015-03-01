// http://jsperf.com/pjs-serialization-comparison/4

// HTML setup
<script src="http://mrale.ph/irhydra/jsperf-renamer.js"></script>
<script>
  var fStringified = (function () {
    var n = 1000;
    var sum = 0;
    for (var i = 0; i < n; i++) {
      sum = i + (n * 2 - (i * 3));
      sum--;
    }
    var counter = ((function () { 
      var safeCounter = 0;
      return function () { safeCounter++; return safeCounter;};
    })());
    while (800 > counter()) {
      sum--;
    }
    return sum;
  }).toString();

  var nonNativeEncode = function (str) {
    var strLength = str.length;
    var buf = new ArrayBuffer(strLength * 2);
    var bufView = new Uint16Array(buf);
    for (; strLength--; ) {
      bufView[strLength] = str.charCodeAt(strLength);
    }
    return bufView;
  };
  var nonNativeDecode = function (ab) {
    return String.fromCharCode.apply(null, ab);
  };

  var encoder = new TextEncoder();
  var decoder = new TextDecoder();

  //
  var withNonNativeFunction = function () {
    var encodedF = nonNativeEncode(fStringified);
    var decodedF = nonNativeDecode(encodedF);
    if (decodedF === fStringified) {
      console.log(decodedF);
    } else {
      console.log('error');
    }
  }

  var withEncodingAPI = function () {
    var encodedF = encoder.encode(fStringified);
    var decodedF = decoder.decode(encodedF);
    if (decodedF === fStringified) {
      console.log(decodedF);
    } else {
      console.log('error');
    }
  };
</script>

// Test case 1 - Non-native function
withNonNativeFunction();

// Test case 2 - Native encoding API
withEncodingAPI();