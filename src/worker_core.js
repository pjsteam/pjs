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
  map: function (source, target, start, end, f, ctx) {
    /*
    var i = start | 0;
    for ( ; (i | 0) < (end | 0); i = (i | 0) + (1 | 0)){
      target[i | 0] = f(source[i | 0], ctx);
    }
    return end;
    */
    var i = start;
    for ( ; i < end; i += 1){
      target[i] = f(source[i]);
    }
    return end;
  },
  filter: function (source, target, start, end, f, ctx) {
    var i = start, newEnd = start;
    for ( ; i < end; i += 1){
      var e = source[i];
      if (f(e, ctx)) {
        target[newEnd++] = e;
      }
    }
    return newEnd;
  },
  reduce: function (source, target, start, end, f, ctx, seed) {
    var i = start;
    var reduced = seed;
    for ( ; i < end; i += 1){
      var e = source[i];
      reduced = f(reduced, e, ctx);
    }
    target[start] = reduced;
    return start + 1;
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
  var sourceArray, targetArray = utils.createTypedArray(pack.elementsType, pack.buffer);
  if (pack.sourceBuffer) {
    sourceArray = utils.createTypedArray(pack.elementsType, pack.sourceBuffer);
  } else {
    sourceArray = targetArray;
  }
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
    newEnd = operations[operation.name](sourceArray, targetArray, start, newEnd, f, localCtx, seed);
    sourceArray = targetArray;
  }
  return {
    message: {
      index: pack.index,
      value: targetArray.buffer,
      start: start,
      newEnd: newEnd,
    },
    transferables: [ targetArray.buffer ]
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