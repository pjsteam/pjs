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
  var saneLocalContext = contextUtils.sanitizeContext(localContext);
  if (!chainContext) {
    return {
      currentIndex: 0,
      "0": saneLocalContext 
    };
  }

  var nextIndex = chainContext.currentIndex + 1;
  var nextContext = {
    currentIndex: nextIndex,
  };
  nextContext[nextIndex] = saneLocalContext;
  return extend(chainContext, nextContext);
};

chainContext.currentContextFromChainContext = function (chainContext) {
  return chainContext[chainContext.currentIndex];
};
