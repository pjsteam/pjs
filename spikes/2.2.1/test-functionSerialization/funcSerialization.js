// Test ran using Chrome javascript console

// JavaScript setup
function setupFunctionWorker(){
  var wCode = function(event){
    var f = event.data;
    postMessage(f());
  };
  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);
  return new Worker(blobURL);
};

var f = function () {
  return 5;
};
var functionWorker = setupFunctionWorker();
functionWorker.onmessage = function(event) {
  if (5 == f) {
    console.log('hi 5!');
  }
}

// Test case - Begin test
functionWorker.postMessage(f);