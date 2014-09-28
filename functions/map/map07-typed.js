/**
  pjs supports only Uint32Array.
  Workers imports pjs.map @p mapper funcion as blob.
  pjs.map @p mapper is passed to workers on postMessage.
  pjs.map @p callback is being called once with the complete ordered result.
*/

// Define
var pjs = {
  lastRunId: 0,
  map: function(array, mapper, callback) {
    var runId = this.lastRunId;
    var finishCount = 0;
    var wks = this.workers;
    var wIndex = wks.length;
    var arrayLength = array.length;
    var factor = Math.floor(arrayLength / wks.length);
    var wCallback = function(event) {
      var data = event.data;
      var time = data.runTime;
      var overallStart = data.overallStart;
      var result = data.result;
      var startIndex = data.startIndex;
      var mapperURL = data.mapperURL;

      if (!pjs.resultMap) {
        pjs.resultMap = [];
      }
      if (!pjs.resultMap[runId]) {
        pjs.resultMap[runId] = [];
      }
      pjs.resultMap[runId][startIndex] = result;

      finishCount++;
      if (finishCount === wks.length) {
        URL.revokeObjectURL(mapperURL);
        var finalMappedArray = new Uint32Array(arrayLength);
        pjs.terminate();
        pjs.resultMap[runId].forEach(function (piece, index) {
          var typedPiece = new Uint32Array(piece);
          for (var j = 0; j < typedPiece.length; j++) {
            finalMappedArray[j + index] = typedPiece[j];
          }
        });
        delete pjs.resultMap[runId];
        console.log('Overall time: ' + (new Date() - overallStart) + ' ms');
        callback(finalMappedArray);
        pjs.terminate();
      }
    };
    var overallStart = new Date();

    this.lastRunId += 1;

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
      w.postMessage({
        startIndex: wStart,
        start: wTime,
        overallStart: overallStart,
        elements: wElements,
        mapperURL: blobMapperURL
      }, [wElements]);
    }
  },
  workers: ((function (){
    var items = [];
    var parts = navigator.hardwareConcurrency || 2;
    var i = parts;

    var wCode = function (event) {
      var eventData = event.data;
      var buffer = eventData.elements;
      var mapperURL = eventData.mapperURL;
      var elements = new Uint32Array(buffer);
      var elementsLength = elements.length;
      var i = elementsLength;
      var result = new Uint32Array(elementsLength);

      importScripts(mapperURL);

      for ( ; i--; ){
        result[i] = __mapper(elements[i]);
      }

      postMessage({
        startIndex: eventData.startIndex,
        result: result.buffer,
        overallStart: eventData.overallStart,
        runTime: new Date() - eventData.start,
        mapperURL: mapperURL
      }, [result.buffer]);
    };
    var blob = new Blob(["onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);
    for (; i--;) {
      var worker = new Worker(blobURL);
      items.push(worker);
    }
    console.log('#workers created: ' + parts);
    return items;
  })()),
  terminate: function () {
    var i = this.workers.length;
    for ( ; i--; ){
      this.workers[i].terminate();
    }
    this.workers = [];
  }
};

// Prepare
var createData = function () {
  var total = 1048576; // 1024 * 1024
  var typed = new Uint32Array(total); // 1Mb * 4
  var i = total;
  for ( ; i-- ; ){
    typed[i] = i * 2;
  }
  return typed;
}

var typedData = createData();

var procesTypedElement = function (element) {
  element += 1;
  element += Math.floor(Math.random() * 2);
  element += Math.floor(Math.random() * 2);
  element += Math.floor(Math.random() * 2);
  return element;
};

var callback = function (elements) {
  console.log(elements);
}

// Perform
pjs.map(typedData, procesTypedElement, callback);
