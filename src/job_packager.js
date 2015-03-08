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

JobPackager.prototype.generatePackages = function (chain) {
  if (!(chain && chain.length)){
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CHAIN);
  }

  var parsedOperations = chain.map(function(link){
    if (!link.code) {
      throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
    }

    if (!link.name || -1 === operations.indexOf(link.name)) {
      throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
    }

    var functionString = link.code.toString();
    var match = functionString.match(FUNCTION_REGEX);
    var packageCodeArgs = match[1].split(',').map(function (p) { return p.trim(); });
    var packageCode = match[2];

    return {
      identity: link.identity,
      args: packageCodeArgs,
      code: packageCode,
      name: link.name
    };
  });

  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);

  return partitionedElements.map(function (partitionedElement, index) {
    return {
      index: index,
      buffer: partitionedElement.buffer,
      operations:  parsedOperations,
      elementsType: elementsType
    };
  });
};
