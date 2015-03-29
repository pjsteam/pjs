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
    console.log('ww - reduce');
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
  var context = createContext(pack.ctx);
  var ops = pack.operations;
  var opsLength = ops.length;

  var array = createTypedArray(pack.elementsType, pack.buffer);
  var newLength = array.length;

  for (var i = 0; i < opsLength; i += 1) {
    var operation = ops[i];
    var seed = operation.identity;
    var args = operation.args;
    var code = operation.code;
    var cacheKey = args.join(',') + code;
    var f = functionCache[cacheKey];
    if (!f){
      f = createFunction(args, code);
      functionCache[cacheKey] = f;
    }
    newLength = operations[operation.name](array, newLength, f, context, seed);
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

function createFunction(args, code) {
  var fArgs = new Array(args);
  fArgs.push(code);
  return Function.prototype.constructor.apply(null, fArgs);
}

function createContext (context) {
  var ctx;
  if (context) {
    ctx = {};
    for (var name in context) {
      if (context.hasOwnProperty(name)) {
        ctx[name] = createContextValue(context[name]);
      }
    }
  }
  return ctx;
}

function createContextValue (value) {
  if (value && value.isFunction && value.args && value.code) {
    return createFunction(value.args, value.code);
  } else {
    return value;
  }
}