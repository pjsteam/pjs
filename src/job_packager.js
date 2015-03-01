var errors = require('./errors.js');
var utils = require('./utils.js');
var Partitioner = require('./typed_array_partitioner.js');
var operation_names = require('./operation_names');

var FUNCTION_REGEX = /^function[^(]*\(([^)]*)\)[^{]*\{([\s\S]*)\}$/;

var operations = Object.keys(operation_names).map(function (k) {
  return operation_names[k];
});

var JobPackager = module.exports = function (parts, code, elements, operation) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  if (!code) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
  }
  if (!elements) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_ELEMENTS);
  }
  if (!operation || -1 === operations.indexOf(operation)) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
  }
  this.parts = parts;
  this.code = code;
  this.elements = elements;
  this.operation = operation;
};

JobPackager.prototype.generatePackages = function () {
  var functionString = this.code.toString();
  var match = functionString.match(FUNCTION_REGEX);
  var packageCodeArg = match[1].split(',')[0].trim();
  var packageCode = match[2];
  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);
  var operation = this.operation;

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
