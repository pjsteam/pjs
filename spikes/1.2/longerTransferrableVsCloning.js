// http://jsperf.com/longer-transferrable-vs-cloning

// JavaScript setup
function createElements() {
  var total = 1024*768; // 786432
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

// Test case 1 - Long cloning
cloningWW.postMessage(elements);

// Test case 2 - Long trasnferrable
transferrableWW.postMessage(elements, [elements.buffer]);