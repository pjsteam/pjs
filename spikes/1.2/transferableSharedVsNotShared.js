// http://jsperf.com/transfer-shared-vs-not-shared

// HTML setup
<script>
  var __finish;

  function createNotSharedElements() {
    return createElements(Uint32Array)
  };

  function createSharedElements() {
    return createElements(SharedUint32Array)
  };

  function createElements(type) {
    var total = 1000000;
    var elements = new type(total);
    for (var i = total; i > 0; i--){
      elements[i - 1] = Math.floor(Math.random() * 10000);
    }
    return elements;
  };

  function setupTransferableWorker(){
    var wCode = function(event){
      var elements = event.data;
      postMessage(elements, [elements.buffer]);
    };

    var blob = new Blob(["onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);

    return new Worker(blobURL);
  };

  var elementsNotSharedA = createNotSharedElements();
  var elementsNotSaherdB = createNotSharedElements();

  var elementsSharedA = createSharedElements();
  var elementsSaherdB = createSharedElements();

  var a = true;
  var b = true;
  var elementsNotShared = elementsNotSharedA;
  var elementsShared = elementsSharedA;

  var transferableNotSharedWW = setupTransferableWorker();
  transferableNotSharedWW.onmessage = function(event) {
    if (a) {
      elementsNotSharedA = event.data;
      elementsNotShared = elementsNotSaherdB;
    } else {
      elementsNotSaherdB = event.data;
      elementsNotShared = elementsNotSharedA;
    }
    a = !a;
    __finish();
  }

  var transferableSharedWW = setupTransferableWorker();
  transferableSharedWW.onmessage = function(event) {
    if (b) {
      elementsSharedA = event.data;
      elementsShared = elementsSaherdB;
    } else {
      elementsSaherdB = event.data;
      elementsShared = elementsSharedA;
    }
    b = !b;
    __finish();
  }
</script>

// JavaScript setup
__finish = function () {
  deferred.resolve();
}

// Test case 1 - not shared transferrable
transferableNotSharedWW.postMessage(elementsNotShared, [elementsNotShared.buffer]);

// Test case 2 - shared transferable
transferableSharedWW.postMessage(elementsShared, [elementsShared.buffer]);