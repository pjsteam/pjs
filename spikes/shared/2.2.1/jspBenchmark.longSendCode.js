// http://jsperf.com/shared-function-transfer

// HTML setup
<script>
  var workersCount = 4;
  var finishedCount;
  var __finish;

  function setupCopyWorker(){
    var wCode = function(event){
      var code = event.data;
      eval('var __f = ' + code);
      postMessage(__f.length);
    };

    var blob = new Blob(["onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);

    return new Worker(blobURL);
  };

  // ---

  function setupTransferrableWorker(){
    var wCode = function(event){
      var codeArray = event.data;
      var aux = new Uint8Array(codeArray.length);
      aux.set(codeArray);
      var code = decoder.decode(aux);
      eval('var __f = ' + code);
      postMessage(__f.length);
    };

    var blob = new Blob(["var decoder = new TextDecoder(); onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);

    return new Worker(blobURL);
  };

  // -------

  var transferrableWorkers = [];
  var copyWorkers = [];

  for (var k = 0; k < workersCount; k += 1) {
    var transferrableWorker = setupTransferrableWorker();
    transferrableWorker.onmessage = function(event) {
      finishWork();
    }
    transferrableWorkers.push(transferrableWorker);

    var copyWorker = setupCopyWorker();
    copyWorker.onmessage = function(event) {
      finishWork();
    }
    copyWorkers.push(copyWorker);
  }

  var encoder = new TextEncoder();

  // ------

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

  var transfer = function () {
    finishedCount = workersCount;
    var b = encoder.encode(fStringified);
    var s = new SharedUint8Array(b.length);
    s.set(b);
    for (var k = 0; k < workersCount; k += 1) {
      transferrableWorkers[k].postMessage(s, [s.buffer]);  
    }
  }

  var copy = function () {
    finishedCount = workersCount;
    for (var k = 0; k < workersCount; k += 1) {
      copyWorkers[k].postMessage(fStringified);
    }
  }

  var finishWork = function () {
    finishedCount--;
    if (finishedCount === 0) {
      __finish();
    }
  }
</script>

// JavaScript setup
__finish = function () {
  deferred.resolve();
};

// Test case 1 - Copy
copy();

// Test case 2 - Transferrable
transfer();