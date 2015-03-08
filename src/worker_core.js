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
  map: function (array, f) {
    var i = array.length;
    for ( ; i--; ){
      array[i] = f(array[i]);
    }
    return array.length;
  },
  filter: function (array, f) {
    var l = array.length;
    var i = 0, newLength = 0;
    for ( ; i < l; i += 1){
      var e = array[i];
      if (f(e)) {
        array[newLength++] = e;
      }
    }
    return newLength;
  },
  reduce: function (array, f, seed) {
    var i = 0;
    var l = array.length;
    var reduced = seed;
    for ( ; i < l; i += 1){
      var e = array[i];
      reduced = f(reduced, e);
    }
    array[0] = reduced;
    return 1;
  }
};

module.exports = function(event){
  var pack = event.data;
  var ops = pack.operations;
  var operation = ops[0];
  var seed = operation.identity;
  var args = operation.args;
  var code = operation.code;

  var cacheKey = args.join(',') + code;
  var f = functionCache[cacheKey];
  if (!f){
    f = createFunction(args, code);
    functionCache[cacheKey] = f;
  }

  var array = createTypedArray(pack.elementsType, pack.buffer);

  var newLength = operations[operation.name](array, f, seed);

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
  if (1 === args.length) {
    /*jslint evil: true */
    return new Function(args[0], code);
  }
  if (2 === args.length) {
    /*jslint evil: true */
    return new Function(args[0], args[1], code);
  }
}