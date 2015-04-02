var operation_names = require('./operation_names');
var Chain = require('./chain');
var operation_packager = require('./operation_packager');

var WrappedTypedArray = function (source, parts, workers) {
  this.source = source;
  this.parts = parts;
  this.workers = workers;
};

WrappedTypedArray.prototype.map = function(mapper, context) {
  return this.__operation(operation_names.MAP, mapper, context);
};

WrappedTypedArray.prototype.filter = function(predicate, context) {
  return this.__operation(operation_names.FILTER, predicate, context);
};

WrappedTypedArray.prototype.reduce = function(reducer, seed, identity, context) {
  return this.__operation(operation_names.REDUCE, reducer, context, seed, identity);
};

WrappedTypedArray.prototype.__operation = function(name, code, context, seed, identity) {
  var operation = operation_packager(name, code, seed, identity);
  return new Chain(this.source, this.parts, this.workers, operation, context);
};

module.exports = WrappedTypedArray;