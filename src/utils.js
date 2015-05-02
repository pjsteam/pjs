var utils = module.exports = {};

var FUNCTION_REGEX = /^function[^(]*\(([^)]*)\)[^{]*\{([\s\S]*)\}$/;

utils.parseFunction = function (code) {
  var functionString = code.toString();
  var match = functionString.match(FUNCTION_REGEX);
  var args = match[1].split(',').map(function (p) { return p.trim(); });
  var body = match[2];
  return { args: args, body: body };
};

utils.isObject = function(object){
  return typeof object === 'object' && !Array.isArray(object);
};

utils.isFunction = function (object) { //http://jsperf.com/alternative-isfunction-implementations
  return !!(object && object.constructor && object.call && object.apply);
};

//TODO: (mati) change method's name. It does nt dcuplicate anymore
utils.duplicateTypedArray = function (array) {
  var type = this.getTypedArrayType(array);
  return this.createTypedArray(type, array.length);
};

// param can be either length (number) or buffer
utils.createTypedArray = function(type, param){
  switch(type){
    case 'SharedUint8Array':
      /*global SharedUint8Array */
      return new SharedUint8Array(param);
    case 'SharedUint8ClampedArray':
      /*global SharedUint8ClampedArray */
      return new SharedUint8ClampedArray(param);
    case 'SharedUint16Array':
      /*global SharedUint16Array */
      return new SharedUint16Array(param);
    case 'SharedUint32Array':
      /*global SharedUint32Array */
      return new SharedUint32Array(param);
    case 'SharedInt8Array':
      /*global SharedInt8Array */
      return new SharedInt8Array(param);
    case 'SharedInt16Array':
      /*global SharedInt16Array */
      return new SharedInt16Array(param);
    case 'SharedInt32Array':
      /*global SharedInt32Array */
      return new SharedInt32Array(param);
    case 'SharedFloat32Array':
      /*global SharedFloat32Array */
      return new SharedFloat32Array(param);
    case 'SharedFloat64Array':
      /*global SharedFloat64Array */
      return new SharedFloat64Array(param);
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
};


utils.getter = function (obj, name, value) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    configurable: true,
    get: function () {
      return value;
    }
  });
};

utils.isTypedArray = function (obj) {
  if (!obj) {
    return false;
  }
  var type = utils.getTypedArrayType(obj);
  switch(type){
    case 'SharedUint8Array':
    case 'SharedUint8ClampedArray':
    case 'SharedUint16Array':
    case 'SharedUint32Array':
    case 'SharedInt8Array':
    case 'SharedInt16Array':
    case 'SharedInt32Array':
    case 'SharedFloat32Array':
    case 'SharedFloat64Array':
    case 'Uint8Array':
    case 'Int8Array':
    case 'Uint8ClampedArray':
    case 'Uint16Array':
    case 'Int16Array':
    case 'Uint32Array':
    case 'Int32Array':
    case 'Float32Array':
    case 'Float64Array':
      return true;
    default:
      return false;
  }
};

utils.isSharedArray = function (obj) {
  if (!obj) {
    return false;
  }
  return utils.getTypedArrayType(obj).indexOf('Shared') > -1;
};

utils.getTypedArrayConstructorType = function(array) {
  var temp = array.toString();
  return temp.substring('function '.length, temp.length - '() { [native code] }'.length);
};

utils.getTypedArrayType = function(array) {
  var temp = array.toString();
  return temp.substring('[object '.length, temp.length - 1);
};

utils.format = function (template) {
  var toReplace = Array.prototype.slice.call(arguments, 1);
  var current = template;
  for (var i = 0; i < toReplace.length; i++) {
    current = current.replace('{' + i + '}', toReplace[i]);
  }
  return current;
};

utils.createFunction = function(args, code){
  switch (args.length) {
    case 0:
      /*jslint evil: true */
      return new Function(code);
    case 1:
      /*jslint evil: true */
      return new Function(args[0], code);
    case 2:
      /*jslint evil: true */
      return new Function(args[0], args[1], code);
    case 3:
      /*jslint evil: true */
      return new Function(args[0], args[1], args[2], code);
    case 4:
      /*jslint evil: true */
      return new Function(args[0], args[1], args[2], args[3], code);
    default:
      return createDynamicArgumentsFunction(args, code);
  }
};

var innerGetNested = function(obj, names, index, fail){
  var next = obj[names[index]];
  if (names.length - 1 === index){
    return next;
  }

  if (!utils.isObject(next)){
    fail();
  }

  return innerGetNested(next, names, ++index);
};

utils.getNested = function(obj, path){
  var parts = path.split('.');

  return innerGetNested(obj, parts, 0, function(){
    throw new Error(
      utils.format('Cannot get nested path {0} from context',
        path));
  });
};

function createDynamicArgumentsFunction(args, code) {
  var fArgs = new Array(args);
  fArgs.push(code);
  return Function.prototype.constructor.apply(null, fArgs);
}