var f = function() { postMessage(null); };

var encoder = new TextEncoder();
var b = encoder.encode(f.toString());
worker.postMessage(b, [b.buffer]);