// http://jsperf.com/worker-cold-start/3

// begin setup

function setupForNewWorkerEachTime(){
  var wCode = function(event){
    postMessage();
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
newWorker.postMessage();
// end benchmark
