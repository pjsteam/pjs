var operation_names = require('./operation_names');
var Skeleton = require('./skeleton');
var operation_packager = require('./operation_packager');

var WrappedTypedArray = function(source, parts, workers){
  this.source = source;
  this.parts = parts;
  this.workers = workers;
};

WrappedTypedArray.prototype.map = function(mapper) {
  var operation = operation_packager(operation_names.MAP, mapper);
  return new Skeleton(this.source, this.parts, this.workers, operation);
};

WrappedTypedArray.prototype.filter = function(predicate) {
  var operation = operation_packager(operation_names.FILTER, predicate);
  return new Skeleton(this.source, this.parts, this.workers, operation);
};

WrappedTypedArray.prototype.reduce = function(reducer, seed, identity) {
  var operation = operation_packager(operation_names.REDUCE, reducer, seed, identity);
  return new Skeleton(this.source, this.parts, this.workers, operation);
};

module.exports = WrappedTypedArray;