var errors = require('./errors.js');
var utils = require('./utils.js');
var Partitioner = require('./typed_array_partitioner.js');

var JobPackager = module.exports = function (parts, code, elements) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  if (!code) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
  }
  if (!elements) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_ELEMENTS);
  }
  this.parts = parts;
  this.code = code;
  this.elements = elements;
};

JobPackager.prototype.generatePackages = function () {
  var packageCode = this.code.toString();
  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);

  return partitionedElements.map(function (partitionedElement, index) {
    return {
      index: index,
      code: packageCode,
      buffer: partitionedElement.buffer,
      elementsType: elementsType
    };
  });
};
