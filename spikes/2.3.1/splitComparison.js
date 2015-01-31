// http://jsperf.com/arraybuffer-split

// JavaScript setup
function createElements() {
  var total = 1000000;
  var elements = new Uint8Array(total);

  for (var i = total; i > 0; i--){
    elements[i - 1] = Math.floor(Math.random() * 10000);
  }
  return elements;
};

var parts = 4;
var elements = createElements();
var elementsCount = elements.length;
var subElementsCount = elementsCount / parts;

function manualSplit (xs) {
  var ys = [];
  for (var i = 0; i < parts; i++) {
    ys.push(new Uint8Array(subElementsCount));
  }

  for (var i = 0; i < subElementsCount; i++) {
    for (var p = 0; p < parts; p++) {
      ys[p][i] = xs[i + p * subElementsCount];
    }
  }
  return ys;
};

function bufferSliceSplit (xs) {
  var ys = [];
  for (var i = 0; i < parts; i++) {
    var b = xs.buffer.slice(i * subElementsCount * xs.BYTES_PER_ELEMENT, (i * subElementsCount + subElementsCount) * xs.BYTES_PER_ELEMENT);
    ys.push(new Uint8Array(b));
  }
  return ys;
};

function bufferSubarraySplit (xs) {
  var ys = [];
  for (var i = 0; i < parts; i++) {
    var subXs = xs.subarray(i * subElementsCount, i * subElementsCount + subElementsCount);
    ys.push(new Uint8Array(subXs));
  }
  return ys;
};

function typedSetSplit (xs) {
  var ys = [];
  for (var i = 0; i < parts; i++) {
    var subXs = xs.subarray(i * subElementsCount, i * subElementsCount + subElementsCount);
    var subYs = new Uint8Array(subElementsCount);
    subYs.set(subXs);
    ys.push(subYs);
  }
  return ys;
};

// Test case 1 - Manual
var r = manualSplit(elements);
if (parts !== r.length) {
  console.log('ups manual');
}

// Test case 2 - Buffer slice
var r = bufferSliceSplit(elements);
if (parts !== r.length) {
  console.log('ups slice');
}

// Test case 3 - Buffer subarray
var r = bufferSubarraySplit(elements);
if (parts !== r.length) {
  console.log('ups subarray');
}

// Test case 4 - TypedArray set
var r = typedSetSplit(elements);
if (parts !== r.length) {
  console.log('ups set');
}