var mutableExtend = require('xtend/mutable');
var utils = require('./utils');
var immutableExtend = require('xtend/immutable');
var contextUtils = require('./context');
var chainContext = require('./chain_context');

// param can be either length (number) or buffer
function createTypedArray(type, param){
  switch(type){
    case 'Uint8Array':
      return new Uint8Array(param);
    case 'Uint8ClampedArray':
      return new Uint8ClampedArray(param);
    case 'Uint16Array':
      return new Uint16Array(param);
    case 'Uint32Array':
      return new Uint32Array(param);
    case 'Int8Array':
      return new Int8Array(param);
    case 'Int16Array':
      return new Int16Array(param);
    case 'Int32Array':
      return new Int32Array(param);
    case 'Float32Array':
      return new Float32Array(param);
    case 'Float64Array':
      return new Float64Array(param);
  }
}

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
  map: function (array, length, f, ctx) {
    var i = 0;
    for ( ; i < length; i += 1){
      array[i] = f(array[i], ctx);
    }
    return length;
  },
  filter: function (array, length, f, ctx) {
    var i = 0, newLength = 0;
    for ( ; i < length; i += 1){
      var e = array[i];
      if (f(e, ctx)) {
        array[newLength++] = e;
      }
    }
    return newLength;
  },
  reduce: function (array, length, f, ctx, seed) {
    var i = 0;
    var reduced = seed;
    for ( ; i < length; i += 1){
      var e = array[i];
      reduced = f(reduced, e, ctx);
    }
    array[0] = reduced;
    return 1;
  }
};

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

  var array = createTypedArray(pack.elementsType, pack.buffer);
  var newLength = array.length;

  for (var i = 0; i < opsLength; i += 1) {
    var localCtx;
    var operation = ops[i];
    var seed = operation.identity;
    var args = operation.args;
    var code = operation.code;
    var cacheKey = args.join(',') + code;
    var f = functionCache[cacheKey];
    if (!f){
      f = utils.createFunction(args, code);
      functionCache[cacheKey] = f;
    }

    if (context) {
      localCtx = immutableExtend(globalContext, context[i]);
    } else {
      localCtx = globalContext;
    }

    newLength = operations[operation.name](array, newLength, f, localCtx, seed);
  }

  return {
    message: {
      index: pack.index,
      value: array.buffer,
      newLength: newLength
    },
    transferables: [ array.buffer ]
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