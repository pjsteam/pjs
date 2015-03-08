var errors = require('./errors.js');
var utils = require('./utils.js');
var Partitioner = require('./typed_array_partitioner.js');
var operation_names = require('./operation_names');

var FUNCTION_REGEX = /^function[^(]*\(([^)]*)\)[^{]*\{([\s\S]*)\}$/;

var operations = Object.keys(operation_names).map(function (k) {
  return operation_names[k];
});

var JobPackager = module.exports = function (parts, elements) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  if (!elements) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_ELEMENTS);
  }
  this.parts = parts;
  this.elements = elements;
};

JobPackager.prototype.generatePackages = function (code, operation) {
  if (!code) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
  }
  if (!operation || -1 === operations.indexOf(operation)) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
  }
  var functionString = code.toString();
  var match = functionString.match(FUNCTION_REGEX);
  var packageCodeArg = match[1].split(',')[0].trim();
  var packageCode = match[2];
  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);

  return partitionedElements.map(function (partitionedElement, index) {
    return {
      index: index,
      arg: packageCodeArg,
      code: packageCode,
      buffer: partitionedElement.buffer,
      elementsType: elementsType,
      operation: operation
    };
  });
};
