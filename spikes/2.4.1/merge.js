// http://jsperf.com/typedarray-merge

// JavaScript setup
var arraySize = 250000;
var arraysCount = 4;

function generateElements() {
  var arrays = [];

  for (var i = 0; i < arraysCount; i++) {
    arrays[i] = new Uint8Array(arraySize);
  }
  
  for (var j = 0; j < arraySize; j++) {
    for (var i = 0; i < arrays.length; i++) {
      arrays[i][j] = j + i * arraySize;
    }
  }
  return arrays;
};

var parts = generateElements();

function caseNonNativeFunction(parts) {
  var totalSize = 0;
  for (var j = 0; j < parts.length; j++) {
    totalSize += parts[j].length;
  }
  var result = new Uint8Array(totalSize);

  var from = 0;
  for (var j = 0; j < parts.length; j++) {
    var part = parts[j];
    var partLength = part.length;
    for (var i = 0; i < partLength; i++) {
      result[from + i] = part[i];
    }
    from += partLength;
  }
  return result;
};

function caseTypedArraySet(parts) {
  var totalSize = 0;
  for (var j = 0; j < parts.length; j++) {
    totalSize += parts[j].length;
  }
  var result = new Uint8Array(totalSize);

  var from = 0;
  for (var j = 0; j < parts.length; j++) {
    var array = parts[j];
    result.set(array, from);
    from += array.length;
  }
  return result;
};

function caseDataViewSet(parts) {
  var totalSize = 0;
  for (var j = 0; j < parts.length; j++) {
    totalSize += parts[j].length;
  }
  var buffer = new ArrayBuffer(totalSize);
  var dv = new DataView(buffer);

  var from = 0;
  for (var j = 0; j < parts.length; j++) {
    var part = parts[j];
    var partLength = part.length;
    for (var i = 0; i < partLength; i++) {
      dv.setUint8(from + i,  part[i]);
    }
    from += partLength;
  }
  return new Uint8Array(buffer);
};

function caseArrayLikeFunction(parts) {
  var totalSize = 0;
  for (var j = 0; j < parts.length; j++) {
    totalSize += parts[j].length;
  }
  var arrayLike = new Array(totalSize);
  var from = 0;
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    var partLength = part.length;
    for (var j = 0; j < partLength; j++) {
      arrayLike[from + j] = part[j];
    }
    from += partLength;
  }
  return new Uint8Array(arrayLike);
}

function withNonNativeFunction(parts) {
  var result = caseNonNativeFunction(parts);
  if (result.length !== (arraySize * arraysCount)) {
    console.log('error');
  }
}

function withTypedArraySet(parts) {
  var result = caseTypedArraySet(parts);
  if (result.length !== (arraySize * arraysCount)) {
    console.log('error');
  }
}

function withDataViewSet(parts) {
  var result = caseDataViewSet(parts);
  if (result.length !== (arraySize * arraysCount)) {
    console.log('error');
  }
}

function withArrayLikeFunction(parts) {
  var result = caseArrayLikeFunction(parts);
  if (result.length !== (arraySize * arraysCount)) {
    console.log('error');
  }
}

// Test case - Non-native function
withNonNativeFunction(parts);

// Test case - TypedArray set function
withTypedArraySet(parts);

// Test case - DataView set function
withDataViewSet(parts);

// Test case - Array like function
withArrayLikeFunction(parts);