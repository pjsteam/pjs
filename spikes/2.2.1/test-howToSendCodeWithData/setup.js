// http://jsperf.com/pjs-encoding

function setupCopyWorker(){
  var wCode = function(event){
    var code = event.data.code;
    var elements = event.data.elements;
    if (elements.length === 10000) {
      postMessage(elements, [elements.buffer]);
    }
  };

  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
};

var copyWorker = setupCopyWorker();
copyWorker.onmessage = function(event) {
  deferred.resolve();
}

// ---

function setupTransferrableWorker(){
  var wCode = function(event){
    var elements = event.data.elements;
    var codeBuffer = event.data.code;
    var codeArray = new Uint8Array(codeBuffer);
    var code = decoder.decode(codeArray);
    if (elements.length === 10000) {
      postMessage(elements, [elements.buffer]);
    }
  };

  var blob = new Blob(["var decoder = new TextDecoder(); onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
};

var transferrableWorker = setupTransferrableWorker();
transferrableWorker.onmessage = function(event) {
  deferred.resolve();
}

var encoder = new TextEncoder();

// --

var generateElements = function () {
  var total = 10000;
  var typed = new Uint8Array(total);
  for (var i = total; i > 0; i--){
    typed[i - 1] = i;
  }
  return typed;
};
var generateElements2 = function () {
  var total = 10000;
  var typed = new Uint8Array(total);
  for (var i = total; i > 0; i--){
    typed[i - 1] = i;
  }
  return typed;
};

var fStringified = (function () {
  postMessage(null);
}).toString();