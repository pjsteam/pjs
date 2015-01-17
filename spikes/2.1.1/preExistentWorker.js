// http://jsperf.com/worker-cold-start

// begin setup

function preForPreExistentWorker(){
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

var worker = preForPreExistentWorker();

worker.onmessage = function(event){
  // console.log('here');
  deferred.resolve();
}
// end setup

// begin benchmark
postCode(worker, function() { postMessage(); });
// end benchmark