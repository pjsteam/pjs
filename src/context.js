var utils = require('./utils');

var contextUtils = module.exports = {}; //TODO: (mati) generate unit tests

contextUtils.serialize = function (context) {
  return JSON.stringify(this.sanitizeContext(context));
};

contextUtils.sanitizeContext = function (context) {
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
};

contextUtils.deSanitizeContext = function (context) {
  var ctx;
  if (context) {
    ctx = {};
    for (var name in context) {
      if (context.hasOwnProperty(name)) {
        ctx[name] = deSanitizeContextValue(context[name]);
      }
    }
  }
  return ctx;
};

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

function deSanitizeContextValue (value) {
  if (value && value.__isFunction && value.args && value.code) {
    return createDynamicArgumentsFunction(value.args, value.code);
  } else {
    return value;
  }
}

function createDynamicArgumentsFunction(args, code) {
  var fArgs = new Array(args);
  fArgs.push(code);
  return Function.prototype.constructor.apply(null, fArgs);
}