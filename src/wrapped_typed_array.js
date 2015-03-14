var operation_names = require('./operation_names');
var Skeleton = require('./skeleton');

var WrappedTypedArray = function(source, parts, workers){
  this.source = source;
  this.parts = parts;
  this.workers = workers;
};

WrappedTypedArray.prototype.map = function(mapper) {
  return new Skeleton(this.source, this.parts, this.workers, operation_names.MAP, mapper);
};

WrappedTypedArray.prototype.filter = function(predicate) {
  return new Skeleton(this.source, this.parts, this.workers, operation_names.FILTER, predicate);
};

WrappedTypedArray.prototype.reduce = function(reducer, seed, identity) {
  return new Skeleton(this.source, this.parts, this.workers, operation_names.REDUCE, reducer, seed, identity);
};

module.exports = WrappedTypedArray;