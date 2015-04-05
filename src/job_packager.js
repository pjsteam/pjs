var errors = require('./errors');
var utils = require('./utils');
var Partitioner = require('./typed_array_partitioner');
var contextSerializer = require('./chain_context');

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

JobPackager.prototype.generatePackages = function (operations, chainContext) {
  if (!(operations && operations.length)){
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATIONS);
  }

  var parsedOperations = operations.map(function(op){
    if (!(op.code || op.functionPath)) {
      throw new errors.InvalidArgumentsError(errors.messages.MISSING_CODE_OR_PATH);
    }

    if (!op.name || -1 === operation_names.indexOf(op.name)) {
      throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
    }

    if (!op.functionPath){
      var parsed = utils.parseFunction(op.code.toString());

      return {
        identity: op.identity,
        args: parsed.args,
        code: parsed.body,
        name: op.name
      };
    }

    return {
      identity: op.identity,
      name: op.name,
      functionPath: op.functionPath
    };
  });

  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);

  var self = this;

  var strfyCtx = contextSerializer.serializeChainContext(chainContext);
  return partitionedElements.map(function (partitionedElement, index) {
    return {
      index: index,
      start: partitionedElement.from,
      end: partitionedElement.to,
      buffer: self.elements.buffer,
      operations: parsedOperations,
      elementsType: elementsType,
      ctx: strfyCtx
    };
  });
};
