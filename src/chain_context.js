var contextUtils = require('./context');
var extend = require("xtend");

var chainContext = module.exports = {};

chainContext.serializeChainContext = function (chainContext) {
  return JSON.stringify(chainContext);
};

chainContext.deserializeChainContext = function (chainContext) {
  return JSON.parse(chainContext);
};

chainContext.extendChainContext = function (localContext, chainContext) {
  var saneLocalContext = contextUtils.serializeFunctions(localContext);
  if (!chainContext) {
    var ctx = {
      currentIndex: 0,
    };
    ctx[0] = saneLocalContext;
    return ctx;
  }

  var nextIndex = chainContext.currentIndex + 1;
  var nextContext = {
    currentIndex: nextIndex,
  };
  nextContext[nextIndex] = saneLocalContext;
  return extend(chainContext, nextContext);
};

chainContext.currentContextFromChainContext = function (chainContext) {
  var currentContext = chainContext[chainContext.currentIndex];
  if (currentContext) {
    return contextUtils.deserializeFunctions(currentContext);
  }
  return undefined;
};
