var utils = require('./utils');

var context = module.exports = {};

context.serializeFunctions = function (obj) {
  var res;
  if (obj) {
    res = Object.keys(obj).reduce(function(c,v){
      var value = obj[v];
      if (utils.isFunction(value)){
        c[v] = serializeFunction(value);
      } else if (utils.isObject(value)){
        c[v] = context.serializeFunctions(value);
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