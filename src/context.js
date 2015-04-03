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
  return utils.createFunction(value.args, value.code);
}