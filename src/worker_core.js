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

module.exports = function(event){
  var pack = event.data;
  var arg = pack.arg;
  var code = pack.code;
  var cacheKey = arg + code;
  var f = functionCache[cacheKey];
  if (!f){
    /*jslint evil: true */
    f = new Function(arg, code);
    functionCache[cacheKey] = f;
  }

  var array = createTypedArray(pack.elementsType, pack.buffer);

  var i = array.length;
  for ( ; i--; ){
    array[i] = f(array[i]);
  }
  return {
    message: {
      index: pack.index,
      value: array.buffer
    },
    transferables: [ array.buffer ]
  };
};
