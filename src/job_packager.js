var errors = require('./errors');
var utils = require('./utils');
var Partitioner = require('./typed_array_partitioner');
var contextSerializer = require('./context');

var operation_names = require('./operation_names');
operation_names = Object.keys(operation_names).map(function (k) {
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

JobPackager.prototype.generatePackages = function (operations, context) {
  if (!(operations && operations.length)){
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATIONS);
  }

  var parsedOperations = operations.map(function(op){
    if (!op.code) {
      throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
    }

    if (!op.name || -1 === operation_names.indexOf(op.name)) {
      throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
    }

    var packageCodeArgs;
    var packageCode;
    utils.parseFunction(op.code, function (args, body) {
      packageCodeArgs = args;
      packageCode = body;
    });

    return {
      identity: op.identity,
      args: packageCodeArgs,
      code: packageCode,
      name: op.name
    };
  });

  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);

  var strfyCtx = contextSerializer.serialize(context);
  return partitionedElements.map(function (partitionedElement, index) {
    return {
      index: index,
      buffer: partitionedElement.buffer,
      operations: parsedOperations,
      elementsType: elementsType,
      ctx: strfyCtx
    };
  });
};
