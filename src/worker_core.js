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

module.exports = function(event){
  var pack = event.data;
  console.time('ww-' + pack.index + '-total');
  console.time('ww-' + pack.index + '-init');
  var arg = pack.arg;
  var code = pack.code;
  console.time('ww-' + pack.index + '-genFunc');
  /*jslint evil: true */
  var f = new Function(arg, code);
  console.timeEnd('ww-' + pack.index + '-genFunc');
  var array = createTypedArray(pack.elementsType, pack.buffer);

  var i = array.length;
  console.timeEnd('ww-' + pack.index + '-init');
  console.time('ww-' + pack.index + '-map');
  for ( ; i--; ){
    array[i] = f(array[i]);
  }
  console.timeEnd('ww-' + pack.index + '-map');
  console.timeEnd('ww-' + pack.index + '-total');
  return {
    message: {
      index: pack.index,
      value: array.buffer
    },
    transferables: [ array.buffer ]
  };
};
