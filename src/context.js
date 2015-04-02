var utils = require('./utils');

var ctx = {};
module.exports = ctx;

ctx.deserializeFunctions = function(obj){
  return Object.keys(obj).reduce(function(c,v){
    var value = obj[v];

    if (utils.isObject(value)){
      if (value.__isFunction){
        c[v] = deserializeFunction(value);
      } else {
        ctx.deserializeFunctions(value);
      }
    }

    return c;
  }, obj);
};

ctx.serializeFunctions = function (obj) {
  var res;
  if (obj) {
    res = Object.keys(obj).reduce(function(c,v){
      var value = obj[v];
      if (utils.isFunction(value)){
        c[v] = serializeFunction(value);
      } else if (utils.isObject(value)){
        c[v] = ctx.serializeFunctions(value);
      } else {
        c[v] = value;
      }

      return c;
    }, {});
  }
  return res;
};

function serializeFunction (value) {
  var parsed = utils.parseFunction(value);
  return {
    __isFunction: true,
    args: parsed.args,
    code: parsed.body
  };
}

function deserializeFunction(value) {
  var args = value.args;
  var code = value.code;
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
}

function createDynamicArgumentsFunction(args, code) {
  var fArgs = new Array(args);
  fArgs.push(code);
  return Function.prototype.constructor.apply(null, fArgs);
}
