var utils = require('./utils');

var context = module.exports = {}; //TODO: (mati) generate unit tests

context.serialize = function (context) {
  var ctx = sanitizeContext(context);
  return JSON.stringify(ctx);
};

//TODO: (mati)
// context.parse = function (context) {

// };

function sanitizeContext (context) {
  var ctx;
  if (context) {
    ctx = {};
    for (var name in context) {
      if (context.hasOwnProperty(name)) {
        ctx[name] = sanitizeContextValue(context[name]);
      }
    }
  }
  return ctx;
}

function sanitizeContextValue (value) {
  if (utils.isFunction(value)) {
    var packageCodeArgs;
    var packageCode;
    utils.parseFunction(value, function (args, body) {
      packageCodeArgs = args;
      packageCode = body;
    });
    return {
      __isFunction: true,
      args: packageCodeArgs,
      code: packageCode
    };
  } else { //TODO: (mati) ver que pasa con otros tipos
    return value;
  }
}

