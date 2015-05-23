var contextUtils = require('./context');
var extend = require("xtend");

var chainContext = module.exports = {};

chainContext.serializeChainContext = function (chainContext) {
  return JSON.stringify(chainContext);
};

chainContext.deserializeChainContext = function (chainContext) {
  return JSON.parse(chainContext);
};

chainContext.extendChainContext = function (currentIndex, localContext, chainContext) {
  if (!localContext && !chainContext) {
    return undefined;
  }
  if (!localContext) {
    return extend(chainContext, undefined);
  }
  var nextContext = {};
  nextContext[currentIndex] = contextUtils.serializeFunctions(localContext);
  if (!chainContext) {
    return nextContext;
  }
  return extend(chainContext, nextContext);
};

chainContext.contextFromChainContext = function (currentIndex, chainContext) {
  if (chainContext && chainContext[currentIndex]) {
    return contextUtils.deserializeFunctions(chainContext[currentIndex]);
  }
  return undefined;
};
