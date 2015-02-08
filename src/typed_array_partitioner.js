var Partitioner = module.exports = function (parts) {
  if (undefined === parts) {
    throw new errors.InvalidArgumentsError(errors.messages.PARTITIONER_MISSING_PARTS); 
  }
  utils.getter(this, 'parts', parts);
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
    throw new errors.InvalidArgumentsError('Invalid Type: ' + array + '. ' + errors.messages.PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY);
  };
};

Partitioner.prototype.doPartition = function (array) {
  var parts = this.parts;
  var subElementsCount = parseInt(array.length / parts);
  var arrays = [];
  for (var i = 0; i < parts; i++) {
    var begin = i * subElementsCount;
    var end = i * subElementsCount + subElementsCount;
    if (parts - 1 === i) {
      end = array.length;
    }
    var subXs = array.subarray(begin, end);
    arrays.push(new array.constructor(subXs));
  }
  return arrays;
};
