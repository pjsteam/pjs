var f = function() { postMessage(null); };

var encoder = new TextEncoder();
var b = encoder.encode(f.toString());
arrayBufferWorker.postMessage({code: b, size: 8}, [b.buffer]);