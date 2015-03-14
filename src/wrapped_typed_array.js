var operation_names = require('./operation_names');
var Skeleton = require('./skeleton');
var operation_packager = require('./operation_packager');

var WrappedTypedArray = function (source, parts, workers) {
  this.source = source;
  this.parts = parts;
  this.workers = workers;
};

WrappedTypedArray.prototype.map = function(mapper) {
  return this.__operation(operation_names.MAP, mapper);
};

WrappedTypedArray.prototype.filter = function(predicate) {
  return this.__operation(operation_names.FILTER, predicate);
};

WrappedTypedArray.prototype.reduce = function(reducer, seed, identity) {
  return this.__operation(operation_names.REDUCE, reducer, seed, identity);
};

WrappedTypedArray.prototype.__operation = function(name, reducer, seed, identity) {
  var operation = operation_packager(name, reducer, seed, identity);
  return new Skeleton(this.source, this.parts, this.workers, operation);
};

module.exports = WrappedTypedArray;