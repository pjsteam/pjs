var mutableExtend = require('xtend/mutable');
var utils = require('./utils');
var immutableExtend = require('xtend/immutable');
var contextUtils = require('./context');
var chainContext = require('./chain_context');

function getMapFactory(){
  if (typeof Map === 'function'){
    return function(){
      /* jshint ignore:start */
      return new Map();
      /* jshint ignore:end */
    };
  } else {
    return function(){
      return Object.create(null);
    };
  }
}

var mapFactory = getMapFactory();

var functionCache = mapFactory();

var globalContext = {};

var operations = {
  map: function (array, start, end, f, ctx) {
    var i = start;
    for ( ; i < end; i += 1){
      array[i] = f(array[i], ctx);
    }
    return end;
  },
  filter: function (array, start, end, f, ctx) {
    var i = start, newEnd = start;
    for ( ; i < end; i += 1){
      var e = array[i];
      if (f(e, ctx)) {
        array[newEnd++] = e;
      }
    }
    return newEnd;
  },
  reduce: function (array, start, end, f, ctx, seed) {
    var i = start;
    var reduced = seed;
    for ( ; i < end; i += 1){
      var e = array[i];
      reduced = f(reduced, e, ctx);
    }
    array[0] = reduced;
    return 1;
  }
};

function getFunction(operation){
  if (operation.functionPath){
    return utils.getNested(globalContext, operation.functionPath);
  }

  var args = operation.args;
  var code = operation.code;
  var cacheKey = args.join(',') + code;
  var f = functionCache[cacheKey];
  if (!f){
    f = utils.createFunction(args, code);
    functionCache[cacheKey] = f;
  }

  return f;
}

module.exports = function(event){
  var pack = event.data;

  if (pack.contextUpdate){
    var deserialized = contextUtils.deserializeFunctions(
      JSON.parse(pack.contextUpdate));
    mutableExtend(globalContext, deserialized);

    return {
      message: {
        index: pack.index
      }
    };
  }

  var ops = pack.operations;
  var opsLength = ops.length;
  var context = createOperationContexts(opsLength, pack.ctx);
  var array = utils.createTypedArray(pack.elementsType.replace('Shared', ''), pack.buffer);
  var start = pack.start;
  var newEnd = pack.end;

  for (var i = 0; i < opsLength; i += 1) {
    var localCtx;
    var operation = ops[i];
    var seed = operation.identity;
    var f = getFunction(operation);

    if (context) {
      localCtx = immutableExtend(globalContext, context[i]);
    } else {
      localCtx = globalContext;
    }

    newEnd = operations[operation.name](array, start, newEnd, f, localCtx, seed);
  }
  return {
    message: {
      index: pack.index,
      value: array.buffer,
      start: start,
      newEnd: newEnd,
    },
    transferables: [ array.buffer ]
  };
};

function createOperationContexts (operationLength, context) {
  var operationContexts;
  if (context) {
    context = chainContext.deserializeChainContext(context);
    operationContexts = {};
    for (var i = 0; i <= operationLength; i++) {
      if (context[i]){
        operationContexts[i] = contextUtils.deserializeFunctions(context[i]);
      }
    }
  }
  return operationContexts;
}