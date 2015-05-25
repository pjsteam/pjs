// http://jsperf.com/transferrable-vs-cloning/3

// HTML setup
<script>
  var __finish;

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
    __finish();
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
    __finish();
  }
</script>

// JavaScript setup
__finish = function () {
  deferred.resolve();
}

// Test case 1 - Cloning
cloningWW.postMessage(elements);

// Test case 2 - Transferrable
transferrableWW.postMessage(elements, [elements.buffer]);
