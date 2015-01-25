var f = function () {
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
  postMessage(sum);
};

var str2ab = function (str) {
  var strLength = str.length;
  var buf = new ArrayBuffer(strLength * 2);
  var bufView = new Uint16Array(buf);
  var i = strLength;
  for (; i--; ) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
};

var b = str2ab(f.toString());
worker.postMessage(b, [b.buffer]);