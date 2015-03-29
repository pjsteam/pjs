function createTypedArray (length) {
  var result = new Uint32Array(length);
  for (var i = length; i > 0; i--){
    result[i - 1] = Math.floor(Math.random() * 10000)
    + Math.floor(Math.random() * 10000)
    + Math.floor(Math.random() * 10000)
    + Math.floor(Math.random() * 10000);
  }
  return result;
};

function createPackage(typedArray) {
  return {
    index: 2,
    buffer: typedArray.buffer,
    operations:  [{
      name: 'map',
      args: ['e'],
      code: '{ return e * 4 + Math.rand() % 1000 + 1 / e; }' 
    }],
    elementsType: 'Uint32Array'
  };
};

var elements = createTypedArray(1000000);
var pack = createPackage(elements);

var strFunc = (function (e) { return (Math.rand() % 1000) + e * 3; }).toString();
var mapCtx = new Map();
mapCtx.set('func', {
    __isFunction: true,
    code: strFunc
  });
mapCtx.set('data', 'daaaaaata');

var d = new Map();
d.set('ctx', mapCtx);
d.set('pack', pack);
console.log(d);
JSON.stringify(d);