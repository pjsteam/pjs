var operation_names = require('./operation_names');
var Chain = require('./chain');
var operation_packager = require('./operation_packager');
var contextUtils = require('./chain_context');
var utils = require('./utils');

var WrappedTypedArray = function (source, parts, globalContext) {
  this.source = source;
  this.parts = parts;
  this.globalContext = globalContext;
};

WrappedTypedArray.prototype.map = function(mapper, context) {
  return this.__operation(operation_names.MAP, mapper, context);
};

WrappedTypedArray.prototype.filter = function(predicate, context) {
  return this.__operation(operation_names.FILTER, predicate, context);
};

WrappedTypedArray.prototype.reduce = function(reducer, seed, identityReducer, identity, context) {
  if (!utils.isFunction(identityReducer)) {
    context = identity;
    identity = identityReducer;
    identityReducer = reducer;
  }
  return this.__operation(operation_names.REDUCE, reducer, context, seed, identity, identityReducer);
};

WrappedTypedArray.prototype.__operation = function(name, code, localContext, seed, identity, identityCode) {
  var operation = operation_packager(name, code, seed, identity, identityCode);
  var chainContext = contextUtils.extendChainContext(0, localContext);
  var options = {
    source: this.source,
    parts: this.parts,
    operation: operation,
    globalContext: this.globalContext,
    chainContext: chainContext
  };
  return new Chain(options);
};

module.exports = WrappedTypedArray;