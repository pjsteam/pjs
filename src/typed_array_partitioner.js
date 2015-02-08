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
  if (!array) {
    throw new errors.InvalidArgumentsError(errors.messages.PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY); 
  }
  var temp = array.toString();
  type = temp.substring('[object '.length, temp.length - 1);
  switch(type){
    case 'Uint8Array':
    case 'Int8Array':
    case 'Uint8ClampedArray':
    case 'Uint16Array':
    case 'Int16Array':
    case 'Uint32Array':
    case 'Int32Array':
    case 'Float32Array':
    case 'Float64Array':
      return;
    default:
      throw new errors.InvalidArgumentsError('Invalid type: ' + type + '. ' + errors.messages.PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY); 
  }
};

Partitioner.prototype.doPartition = function (array) {
  var parts = this.parts;
  var subElementsCount = array.length / parts;
  var arrays = [];
  for (var i = 0; i < parts; i++) {
    var begin = i * subElementsCount;
    var end = i * subElementsCount + subElementsCount;
    var subXs = array.subarray(begin, end);
    arrays.push(new Uint32Array(subXs));
  }
  return arrays;
};
