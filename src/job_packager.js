var errors = require('./errors.js');
var utils = require('./utils.js');
var Partitioner = require('./typed_array_partitioner.js');

var FUNCTION_REGEX = /^function[^(]*\(([^)]*)\)[^{]*\{([\s\S]*)\}$/

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
  var functionString = this.code.toString();
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
      elementsType: elementsType
    };
  });
};
