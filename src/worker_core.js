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
  map: function (source, target, length, f, ctx) {
    var i = 0;
    for ( ; i < length; i += 1){
      target[i] = f(source[i], ctx);
    }
    return length;
  },
  filter: function (source, target, length, f, ctx) {
    var i = 0, newLength = 0;
    for ( ; i < length; i += 1){
      var e = source[i];
      if (f(e, ctx)) {
        target[newLength++] = e;
      }
    }
    return newLength;
  },
  reduce: function (source, target, length, f, ctx, seed) {
    var i = 0;
    var reduced = seed;
    for ( ; i < length; i += 1){
      var e = source[i];
      reduced = f(reduced, e, ctx);
    }
    target[0] = reduced;
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

  var context = createOperationContexts(pack.ctx);
  var ops = pack.operations;
  var opsLength = ops.length;

  var partLength = pack.end - pack.start;

  var target = utils.createTypedArray(pack.elementsType.replace('Shared', ''), partLength);

  var source = utils.createTypedArray(pack.elementsType, pack.buffer, pack.start, partLength);

  var newLength = source.length;

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

    newLength = operations[operation.name](source, target, newLength, f, localCtx, seed);
  }

  return {
    message: {
      index: pack.index,
      value: target.buffer,
      newLength: newLength,
    },
    transferables: [ target.buffer ]
  };
};

function createOperationContexts (context) {
  var operationContexts;
  if (context) {
    context = chainContext.deserializeChainContext(context);
    operationContexts = {};
    for (var i = 0; i <= context.currentIndex; i++) {
      if (context[i]){
        operationContexts[i] = contextUtils.deserializeFunctions(context[i]);
      }
    }
  }
  return operationContexts;
}