var errors = require('./errors');
var utils = require('./utils');
var Partitioner = require('./typed_array_partitioner');

var operation_names = require('./operation_names');
operation_names = Object.keys(operation_names).map(function (k) {
  return operation_names[k];
});

var FUNCTION_REGEX = /^function[^(]*\(([^)]*)\)[^{]*\{([\s\S]*)\}$/;

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
    parseFunction(op.code, function (args, body) {
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

  var ctx = sanitizeContext(context);
  var strfyCtx = JSON.stringify(ctx);
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

function parseFunction (code, callback) {  
  var functionString = code.toString();
  var match = functionString.match(FUNCTION_REGEX);
  var args = match[1].split(',').map(function (p) { return p.trim(); });
  var body = match[2];
  callback(args, body);
}

function sanitizeContext (context) {
  var ctx;
  if (context) {
    ctx = {};
    for (var name in context) {
      if (context.hasOwnProperty(name)) {
        ctx[name] = sanitizeContextValue(context[name]);
      }
    }
  }
  return ctx;
}

function sanitizeContextValue (value) {
  if (utils.isFunction(value)) {
    var packageCodeArgs;
    var packageCode;
    parseFunction(value, function (args, body) {
      packageCodeArgs = args;
      packageCode = body;
    });
    return {
      isFunction: true,
      args: packageCodeArgs,
      code: packageCode
    };
  } else { //TODO: (mati) ver que pasa con otros tipos
    return value;
  }
}