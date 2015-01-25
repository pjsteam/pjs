// http://jsperf.com/pjs-serialization/2
// http://jsperf.com/pjs-serialization-long
// sending code by transferrable objects

var b = encoder.encode(fStringified);
transferrableWorker.postMessage(b, [b.buffer]);