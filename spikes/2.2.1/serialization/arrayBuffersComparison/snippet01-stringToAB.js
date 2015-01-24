var f = function() { postMessage(null); };

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