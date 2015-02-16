// http://jsperf.com/worker-cold-start/5

// JavaScript setup
function setupForPreExistentWorker(){
  var wCode = function(event){
    var codeBuffer = event.data;
    var codeArray = new Uint8Array(codeBuffer);
    var decoder = new TextDecoder();
    var code = decoder.decode(codeArray);

    eval('var __f = ' + code);

    __f();
  };

  var blob = new Blob([
      "onmessage = " + wCode.toString()]);

  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}

var encoder = new TextEncoder();

function postCode(worker, f){
  var b = encoder.encode(f.toString());
  worker.postMessage(b.buffer, [b.buffer]);
}

var worker = setupForPreExistentWorker();

worker.onmessage = function(event){
  deferred.resolve();
}

function setupForNewWorkerEachTime(){
  var wCode = function(event){
    postMessage(null);
  };

  var blob = new Blob([
    "onmessage = " + wCode.toString()]);

  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}

// Test case 1 - Pre existent worker
postCode(worker, function() { postMessage(null); });

// Test case 2 - New workers
var newWorker = setupForNewWorkerEachTime();

newWorker.onmessage = function(event){
  newWorker.terminate();
  deferred.resolve();
}
newWorker.postMessage(null);