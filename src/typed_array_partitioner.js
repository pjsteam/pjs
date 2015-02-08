var Partitioner = module.exports = function (parts) {
  if (undefined === parts) {
    throw new errors.InvalidArgumentsError(errors.messages.PARTITIONER_MISSING_PARTS); 
  }
  this.parts = parts;
};

var utils = require('./utils.js');
var errors = require('./errors.js');

Partitioner.prototype.constructor = Partitioner;

Partitioner.prototype.partition = function (array) {
  this.validateTypedArray(array);
  return this.doPartition(array, this);
};

Partitioner.prototype.validateTypedArray = function (array) {
  if (!utils.isTypedArray(array)) {
    var message = utils.format('Invalid type {0}. {1}', array, errors.messages.PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY);
    throw new errors.InvalidArgumentsError(message);
  };
};

Partitioner.prototype.doPartition = function (array) {
  var parts = this.parts;
  var elementsCount = array.length;
  var subElementsCount = (elementsCount / parts) | 0;
  var from = 0;
  var to = 0;

  var arrays = new Array(parts);
  for (var i = 0; i < parts; i++) {
    if (parts - 1 === i) {
      to = elementsCount;
    } else {
      to += subElementsCount;
    }
    arrays[i] = typedArraySlice(array, from, to);
    from += subElementsCount;
  }
  return arrays;
};

var typedArraySlice = function (array, from, to) {
  var subXs = array.subarray(from, to);
  return new array.constructor(subXs);
}