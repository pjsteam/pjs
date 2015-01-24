var f = function() { postMessage(null); };

var blob = new Blob(['__f = ' + f.toString()], { type: 'application/javascript' });
var blobURL = window.URL.createObjectURL(blob);

blobWorker.postMessage({ blobURL: blobURL });