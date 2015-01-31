// The following test uses ArrayBuffer of 100000 elements:
// http://jsperf.com/transferrable-vs-cloning
//
// The following test uses ArrayBuffer of 786432 (7.8 times the first test) elements:
// http://jsperf.com/longer-transferrable-vs-cloning

// ECMAScript setup
function createElements() {
  var total = 100000;
  var elements = new Uint32Array(total);

  for (var i = total; i > 0; i--){
    elements[i - 1] = Math.floor(Math.random() * 10000);
  }
  return elements;
};

function setupTransferrableWorker(){
  var wCode = function(event){
    var elements = event.data;
    postMessage(elements, [elements.buffer]);
  };

  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
};

function setupCloningWorker(){
  var wCode = function(event){
    var elements = event.data;
    postMessage(elements);
  };

  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
};

var elementsA = createElements();
var elementsB = createElements();
var a = true;
var elements = elementsA;

var cloningWW = setupCloningWorker();
cloningWW.onmessage = function(event) {
  deferred.resolve();
}

var transferrableWW = setupTransferrableWorker();
transferrableWW.onmessage = function(event) {
  if (a) { // https://esdiscuss.org/topic/arraybuffer-neutering
    elementsA = event.data;
    elements = elementsB;
  } else {
    elementsB = event.data;
    elements = elementsA;
  }
  a = !a;
  deferred.resolve();
}

// Test case 1
cloningWW.postMessage(elements);

// Test case 2
transferrableWW.postMessage(elements, [elements.buffer]);
