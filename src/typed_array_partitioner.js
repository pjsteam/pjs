var utils = require('./utils.js');
var errors = require('./errors.js');

var typedArraySlice = function (array, from, to) {
  var subXs = array.subarray(from, to);
  return new array.constructor(subXs);
};

var Partitioner = module.exports = function (parts) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  this.parts = parts;
};

Partitioner.prototype.constructor = Partitioner;

Partitioner.prototype.partition = function (array) {
  this.__validateTypedArray(array);
  return this.__doPartition(array, this);
};

Partitioner.prototype.__validateTypedArray = function (array) {
  if (!utils.isTypedArray(array)) {
    var message = utils.format('Invalid type {0}. {1}', array, errors.messages.PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY);
    throw new errors.InvalidArgumentsError(message);
  }
};

Partitioner.prototype.__doPartition = function (array) {
  var parts = this.parts;
  var elementsCount = array.length;
  var subElementsCount = Math.floor(elementsCount / parts) | 0;
  var from = 0;
  var to = 0;
  var isShared = utils.isSharedArray(array);
  var sharedArray;
  var arrays = new Array(parts);
  if (isShared) {
    sharedArray = utils.duplicateTypedArray(array);
  }
  for (var i = 0; i < parts; i++) {
    if (parts - 1 === i) {
      to = elementsCount;
    } else {
      to += subElementsCount;
    }
    if (isShared) {
      arrays[i] = { from:from, to: to, sharedArray: sharedArray, sourceArray: array};
    } else {
      arrays[i] = typedArraySlice(array, from, to);
    }
    from += subElementsCount;
  }
  return arrays;
};