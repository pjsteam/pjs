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

utils.listenOnce = function(eventSource, eventName, callback){
  eventSource.addEventListener(eventName, function messageHandler(event){
    event.target.removeEventListener(eventName, messageHandler);
    return callback(event);
  });
};
