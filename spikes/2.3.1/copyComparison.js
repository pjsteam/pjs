// http://jsperf.com/arraybuffer-copy

// JavaScript setup
function createElements() {
  var total = 1000000;
  var elements = new Uint8Array(total);

  for (var i = total; i > 0; i--){
    elements[i - 1] = Math.floor(Math.random() * 10000);
  }
  return elements;
};

var elements = createElements();
var elementsCount = elements.length;

var fileReader = new FileReader();

function manualCopy (xs) {
  var ys = new Uint8Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    ys[i] = xs[i];
  }
  return ys;
};

function bufferSliceCopy (xs) {
  var ysBuffer = xs.buffer.slice(0);
  return new Uint8Array(ysBuffer);
};

function constructorFromArrayLikeCopy(xs) {
  return new Uint8Array(xs);
};

function typedSetCopy (xs) {
  var ys = new Uint8Array(xs.length);
  ys.set(xs);
  return ys;
};

function bufferSubarrayCopy (xs) {
  var ys = xs.subarray();
  return new Uint8Array(ys);
};

function blobCopy (xs, callback) {
  var b = new Blob([xs.buffer]);
  fileReader.onload = function() {
      callback(new Uint8Array(this.result));
  };
  fileReader.readAsArrayBuffer(b);
};

function dataViewCopy(xs) {
  var buffer = new ArrayBuffer(xs.length);
  var dv = new DataView(buffer);
  for (var i = 0; i < xs.length; i++) {
    dv.setInt8(xs[i]);
  }
  return new Uint8Array(buffer));
}

// Test case 1 - Manual
var r = manualCopy(elements);
if (elementsCount !== r.length || r.buffer === elements.buffer) {
  console.log('error manual');
}

// Test case 2 - Buffer slice
var r = bufferSliceCopy(elements);
if (elementsCount !== r.length || r.buffer === elements.buffer) {
  console.log('error slice');
}

// Test case 3 - Constructor
var r = constructorFromArrayLikeCopy(elements);
if (elementsCount !== r.length || r.buffer === elements.buffer) {
  console.log('error constructor');
}

// Test case 4 - TypedArray set
var r = typedSetCopy(elements);
if (elementsCount !== r.length || r.buffer === elements.buffer) {
  console.log('error set');
}

// Test case 5 - Buffer subarray
var r = bufferSubarrayCopy(elements);
if (elementsCount !== r.length || r.buffer === elements.buffer) {
  console.log('error subarray');
}

// Test case 6 - Blob
blobCopy(elements, function (result) {
  if (elementsCount === result.length) {
    deferred.resolve();
  } else {
    console.log('error blob');
  }
});