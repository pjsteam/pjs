var f = function() { postMessage(null); };

var encoder = new TextEncoder();
var b = encoder.encode(f.toString());
decoderWorker.postMessage(b, [b.buffer]);