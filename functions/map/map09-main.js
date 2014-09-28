// Process
var procesTypedElement = function (element) {
  element += 1;
  element += Math.floor(Math.random() * 2);
  element += Math.floor(Math.random() * 2);
  element += Math.floor(Math.random() * 2);
  return element;
};

var callback = function (elements) {
  console.log('Callback receives ' + elements.length + ' elements');
}

var mapWithBufferArrayView = function (data, Constructor) {
  var elementsLength = data.length;
  var i = elementsLength;
  var results = new Constructor(elementsLength);
  for (; i-- ;) {
    results[i] = procesTypedElement(data[i]);
  }
  return results;
}

// Perform pjs
var runU32Task = function () {
  console.log('Run U32 Task');
  pjs.map(u32Data, procesTypedElement, callback);
};

var runU8Task = function () {
  console.log('Run U8 Task');
  pjs.map(u8Data, procesTypedElement, callback);
};

// Perform serial
var runU32Serial = function () {
  console.log('Run U32 Serial');
  var startTime = new Date();
  var results = mapWithBufferArrayView(u32Data, Uint32Array);
  var endTime = new Date();
  console.log('Run u32 serial time: ' + (endTime - startTime) + ' ms');
  callback(results);
};

var runU8Serial = function () {
  console.log('Run U8 Serial');
  var startTime = new Date();
  var results = mapWithBufferArrayView(u8Data, Uint8Array);
  var endTime = new Date();
  console.log('Run u8 serial time: ' + (endTime - startTime) + ' ms');
  callback(results);
};

// Prepare
var createData = function (Constructor) {
  var total = 1048576; // 1024 * 1024
  var typed = new Constructor(total);
  var i = total;
  for ( ; i-- ; ){
    typed[i] = i * 2;
  }
  return typed;
}

var u32Data = createData(Uint32Array);
var u8Data = createData(Uint8Array);
