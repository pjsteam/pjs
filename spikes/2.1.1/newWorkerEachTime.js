// http://jsperf.com/worker-cold-start/4

// begin setup

function setupForNewWorkerEachTime(){
  var wCode = function(event){
    postMessage(null);
  };

  var blob = new Blob([
    "onmessage = " + wCode.toString()]);

  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}
// end setup

// begin benchmark
var newWorker = setupForNewWorkerEachTime();

newWorker.onmessage = function(event){
  // console.log('here');
  newWorker.terminate();
  deferred.resolve();
}
newWorker.postMessage(null);
// end benchmark
