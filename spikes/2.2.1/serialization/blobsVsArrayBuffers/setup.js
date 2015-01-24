function setupForArrayBufferSerializationWorker(){
  var wCode = function(event){
    var codeBuffer = event.data.code;
    var size = event.data.size;
    var code;
    if (8 === size) { 
      var codeArray = new Uint8Array(codeBuffer);
      var decoder = new TextDecoder();
      code = decoder.decode(codeArray);
    }
    if (16 === size) { 
      code = String.fromCharCode.apply(null, codeBuffer);
    }

    eval('var __f = ' + code);
    __f();
  };

  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}

var arrayBufferWorker = setupForArrayBufferSerializationWorker();
arrayBufferWorker.onmessage = function(event) {
  deferred.resolve();
}

// ------

function setupForBlobSerializationWorker(){
  var wCode = function(event){
    var blobURL = event.data.blobURL;
    importScripts(blobURL);
    
    __f();
  };
  
  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  return new Worker(blobURL);
}

var blobWorker = setupForBlobSerializationWorker();
blobWorker.onmessage = function(event) {
  deferred.resolve();
}