// http://jsperf.com/pjs-serialization/2
// http://jsperf.com/pjs-serialization-long
//sending code by blob

var blob = new Blob(['__f = ' + fStringified], { type: 'application/javascript' });
var blobURL = window.URL.createObjectURL(blob);

blobWorker.postMessage(blobURL);