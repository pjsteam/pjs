// http://jsperf.com/pjs-serialization-long

// JavaScript setup
function setupCopyWorker(){
  var wCode = function(event){
    var code = event.data;
    eval('var __f = ' + code);
    postMessage(__f());
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
    var codeBuffer = event.data;
    var codeArray = new Uint8Array(codeBuffer);
    var code = decoder.decode(codeArray);
    eval('var __f = ' + code);
    postMessage(__f());
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

// ------

function setupForBlobSerializationWorker(){
  var wCode = function(event){
    var blobURL = event.data;
    importScripts(blobURL);
    postMessage(__f());
  };
  
  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}

var blobWorker = setupForBlobSerializationWorker();
blobWorker.onmessage = function(event) {
  deferred.resolve();
}

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

// Test case 1 - Sending code by blob
var blob = new Blob(['__f = ' + fStringified], { type: 'application/javascript' });
var blobURL = window.URL.createObjectURL(blob);

blobWorker.postMessage(blobURL);

// Test case 2 - Sending code by copy
copyWorker.postMessage(fStringified);

// Test case 3 - Sending code by transferrable objects
var b = encoder.encode(fStringified);
transferrableWorker.postMessage(b, [b.buffer]);