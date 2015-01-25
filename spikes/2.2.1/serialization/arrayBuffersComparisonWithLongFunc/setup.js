function setupForArrayBufferSerializationWorker(){
  var wCode = function(event){
    var codeBuffer = event.data;
    var code = String.fromCharCode.apply(null, codeBuffer);
    eval('var __f = ' + code);
    __f();
  };

  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}

var worker = setupForArrayBufferSerializationWorker();
worker.onmessage = function(event) {
  if (event.data === -798) {
    deferred.resolve();
  }
}

function setupForDecoderSerializationWorker(){
  var wCode = function(event){
    var codeBuffer = event.data;
    var codeArray = new Uint8Array(codeBuffer);
    var decoder = new TextDecoder();
    var code = decoder.decode(codeArray);

    eval('var __f = ' + code);
    __f();
  };

  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}

var decoderWorker = setupForDecoderSerializationWorker();
decoderWorker.onmessage = function(event) {
  if (event.data === -798) {
    deferred.resolve();
  }
}