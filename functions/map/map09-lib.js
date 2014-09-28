/**
  This is the first version of pjs library. It exposes only the parallel map function.

  pjs supports all kind of BufferArray Views but DataView.
  Workers imports pjs.map @p mapper funcion as blob.
  pjs.map @p mapper is passed to workers on postMessage.
  pjs.map @p callback is being called once with the complete ordered result.
*/

pjs = ((function () {
  var helper = {
    arrayTypeIdFromStringType : function(stringType) {
      switch(stringType) {
        case '[object Int8Array]': return 1;
        case '[object Uint8Array]': return 2;
        case '[object Uint8ClampedArray]': return 3;
        case '[object Int16Array]': return 4;
        case '[object Uint16Array]': return 5;
        case '[object Int32Array]': return 6;
        case '[object Uint32Array]': return 7;
        case '[object Float32Array]': return 8;
        case '[object Float64Array]': return 9;
        default: return 0;
      };
    },
    bufferArrayConstructorFromTypeId: function (typeId) {
      switch(typeId) {
        case 1: return Int8Array;
        case 2: return Uint8Array;
        case 3: return Uint8ClampedArray;
        case 4: return Int16Array;
        case 5: return Unt16Array;
        case 6: return Int32Array;
        case 7: return Uint32Array;
        case 8: return Float32Array;
        case 9: return Float64Array;
        default: return undefined;
      };
    }
  };

  var library = {};

  var lastRunId = 0;

  var workers = ((function (){
    var items = [];
    var parts = navigator.hardwareConcurrency || 2;
    var i = parts;

    var wCode = function (event) {
      var eventData = event.data;
      var buffer = eventData.elements;
      var mapperURL = eventData.mapperURL;
      var paramsBuffer = eventData.params;
      var params = new Uint32Array(paramsBuffer);
      var typeId = params[3];
      var runTime;
      var bufferArrayConstructorFromTypeId = function (typeId) {
        // This helper function should be imported with importScripts
        switch(typeId) {
          case 1: return Int8Array;
          case 2: return Uint8Array;
          case 3: return Uint8ClampedArray;
          case 4: return Int16Array;
          case 5: return Unt16Array;
          case 6: return Int32Array;
          case 7: return Uint32Array;
          case 8: return Float32Array;
          case 9: return Float64Array;
          default: return undefined;
        }
      };
      var Constructor = bufferArrayConstructorFromTypeId(typeId);
      var elements = new Constructor(buffer);
      var elementsLength = elements.length;
      var i = elementsLength;
      var result = new Constructor(elementsLength);

      importScripts(mapperURL);

      for ( ; i--; ){
        result[i] = __mapper(elements[i]);
      }

      runTime = new Date() - params[1];
      params[1] = runTime;

      postMessage({
        params: paramsBuffer,
        result: result.buffer,
        mapperURL: mapperURL
      }, [paramsBuffer, result.buffer]);
    };
    var blob = new Blob(["onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);
    for (; i--;) {
      var worker = new Worker(blobURL);
      items.push(worker);
    }
    console.log('#workers created: ' + parts);
    return items;
  })());

  var terminate = function () {
    var i = workers.length;
    for ( ; i--; ){
      workers[i].terminate();
    }
    workers = [];
  };

  var resultMap = [];

  var map = function (array, mapper, callback) {
    var runId = lastRunId;
    var finishCount = 0;
    var wks = workers;
    var wIndex = wks.length;
    var arrayLength = array.length;
    var factor = Math.floor(arrayLength / wks.length);
    var wCallback = function(event) {
      var data = event.data;
      var paramsBuffer = data.params;
      var params = new Uint32Array(paramsBuffer);
      var startIndex = params[0];
      var result = data.result;
      var mapperURL = data.mapperURL;

      if (!resultMap[runId]) {
        resultMap[runId] = [];
      }
      resultMap[runId][startIndex] = result;

      console.log('WW.runtime: ' + params[1]);
      finishCount++;
      if (finishCount === wks.length) {
        URL.revokeObjectURL(mapperURL);
        var Constructor = helper.bufferArrayConstructorFromTypeId(params[3]);
        var finalMappedArray = new Constructor(arrayLength);
        resultMap[runId].forEach(function (piece, index) {
          var typedPiece = new Constructor(piece);
          for (var j = 0; j < typedPiece.length; j++) {
            finalMappedArray[j + index] = typedPiece[j];
          }
        });
        delete resultMap[runId];
        params[2] = new Date() - params[2];
        console.log('Overall.runtime: ' + params[2] + ' ms');
        callback(finalMappedArray);
      }
    };
    var overallStart = new Date();
    var typeId = helper.arrayTypeIdFromStringType(Object.prototype.toString.call(array));

    lastRunId += 1;

    var bytesPerElement = array.BYTES_PER_ELEMENT;
    for ( ; wIndex-- ; ) {
      var wTime = new Date();
      var wElements;
      var w = wks[wIndex];
      var aux = 0;
      var wStart = wIndex * factor;
      var wEnd = wStart + factor;
      var blobMapper = new Blob(['__mapper = ' + mapper.toString()], { type: 'application/javascript' });
      var blobMapperURL = window.URL.createObjectURL(blobMapper);

      wElements = array.buffer.slice(wStart * bytesPerElement, wEnd * bytesPerElement);
      w.onmessage = wCallback;

      var paramsBuffer = new ArrayBuffer(16);
      var params = new Uint32Array(paramsBuffer);
      params[0] = wStart;
      params[1] = wTime;
      params[2] = overallStart;
      params[3] = typeId;

      w.postMessage({
        params: paramsBuffer,
        elements: wElements,
        mapperURL: blobMapperURL
      }, [paramsBuffer, wElements]);
    }
  };

  library.map = map;
  library.terminate = terminate;
  return library;
})());
