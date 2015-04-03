// http://jsperf.com/additional-clonningdata-comparison-long/2

// HTML setup
<script>
  var __finish;

  function createTypedArray (length) {
    var result = new Uint32Array(length);
    for (var i = length; i > 0; i--){
      result[i - 1] = Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000);
    }
    return result;
  };

  function createPackage(typedArray) {
    return {
      index: 2,
      buffer: typedArray.buffer,
      operations:  [{
        name: 'map',
        args: ['e'],
        code: '{ return e * 4 + Math.rand() % 1000 + 1 / e; }' 
      }],
      elementsType: 'Uint32Array'
    };
  };

  function setupForPreExistentWorker(){
    var wCode = function(event){
      var data = event.data;
      if (data.pack) {
        postMessage(data.pack.buffer, [data.pack.buffer]);
      }
    };
    var blob = new Blob([
        "onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);
    return new Worker(blobURL);
  };
  var worker = setupForPreExistentWorker();

  function setupForPreExistentStrfyWorker(){
    var wCode = function(event){
      var data = event.data;
      var strfyCtx = data.ctx;
      var ctx = JSON.parse(strfyCtx);
      if (data.pack && ctx) {
        postMessage(data.pack.buffer, [data.pack.buffer]);
      }
    };
    var blob = new Blob([
        "onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);
    return new Worker(blobURL);
  };
  var strfyWorker = setupForPreExistentStrfyWorker();

  worker.onmessage = strfyWorker.onmessage = function(event){
    if (a) {
      elementsA = new Uint32Array(event.data);
      packA = createPackage(elementsA);
      elements = elementsB;
      pack = packB;
    } else {
      elementsB = new Uint32Array(event.data);
      packB = createPackage(elementsB);
      elements = elementsA;
      pack = packA;
    }
    a = !a;
    __finish();
  };
  
  var strFunc1 = (function (e) { return (Math.rand() % 1000) + e * 3; }).toString();
  var strFunc2 = (function (e) { return (e && 0xff00ff00) + Math.rand() % 5000 + 54 > 0xff0a0000; }).toString();
  var strFunc3 = (function (e) { return (Math.rand() % 7364) + Math.pow(e, 2) * 3; }).toString();
  var ctx = {
    func1: {
      __isFunction: true,
      code: strFunc1
    },
    func2: {
      __isFunction: true,
      code: strFunc2
    },
    func3: {
      __isFunction: true,
      code: strFunc3
    },
    data: 'daaaaaata',
    data2: 32424,
    data3: 'looooongdataaaastr'
  };
  var strfyCtx = JSON.stringify(ctx);

  var a = true;
  var elementsA = createTypedArray(1000000);
  var elementsB = createTypedArray(1000000);
  var packA = createPackage(elementsA);
  var packB = createPackage(elementsB);
  var elements = elementsA;
  var pack = packA;

</script>

// JavaScript setup
__finish = function () {
  deferred.resolve();
};


// Test case 1 - sending clonned context
worker.postMessage({ctx: ctx, pack: pack}, [pack.buffer]);

// Test case 2 - sending stringified context
strfyWorker.postMessage({ctx: strfyCtx, pack: pack}, [pack.buffer]);