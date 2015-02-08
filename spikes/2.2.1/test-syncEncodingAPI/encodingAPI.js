// http://jsperf.com/pjs-serialization-comparison/2

// HTML setup
<script src="http://mrale.ph/irhydra/jsperf-renamer.js"></script>

// JavaScript setup
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

var manualEncode = function (str) {
  var strLength = str.length;
  var buf = new ArrayBuffer(strLength * 2);
  var bufView = new Uint16Array(buf);
  for (; strLength--; ) {
    bufView[strLength] = str.charCodeAt(strLength);
  }
  return bufView;
};
var manualDecode = function (ab) {
  return String.fromCharCode.apply(null, ab);
};

var encoder = new TextEncoder();
var decoder = new TextDecoder();

// ---
var withManual = function () {
  var encodedF = manualEncode(fStringified);
  var decodedF = manualDecode(encodedF);
  if (decodedF === fStringified) {
    console.log(decodedF);
  } else {
    console.log('error');
  }
}

var withEncodeAPI = function () {
  var encodedF = encoder.encode(fStringified);
  var decodedF = decoder.decode(encodedF);
  if (decodedF === fStringified) {
    console.log(decodedF);
  } else {
    console.log('error');
  }
};

// Test case 1 - Manual deco
withManual();

// Test case 2 - API deco
withEncodeAPI();