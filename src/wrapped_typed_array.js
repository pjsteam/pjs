var JobPackager = require('./job_packager');
var ResultCollector = require('./result_collector');
var merge_typed_arrays = require('./typed_array_merger');
var operation_names = require('./operation_names');
var utils = require('./utils');

var WrappedTypedArray = function(source, parts, workers){
  this.packager = new JobPackager(parts, source);
  this.source = source;
  this.parts = parts;
  this.workers = workers;
};

WrappedTypedArray.prototype.__operationSkeleton = function (f, operation, collectorMapper, done, identity) {
  var workers = this.workers;
  var packs = this.packager.generatePackages([{ code: f, name: operation, identity: identity}]);
  var collector = new ResultCollector(this.parts, function(results){
    var partial_results = results.map(collectorMapper);
    var m = merge_typed_arrays(partial_results);
    return done(m);
  });

  packs.forEach(function(pack, index){
    utils.listenOnce(workers[index], 'message', function(event){
      collector.onPart(event.data);
    });

    workers[index].postMessage(pack, [ pack.buffer ]);
  });
};

WrappedTypedArray.prototype.map = function(mapper, done) {
  var TypedArrayConstructor = this.source.constructor;
  this.__operationSkeleton(mapper, operation_names.MAP, function(result){
    return new TypedArrayConstructor(result.value);
  }, done);
};

WrappedTypedArray.prototype.filter = function(predicate, done) {
  var TypedArrayConstructor = this.source.constructor;
  this.__operationSkeleton(predicate, operation_names.FILTER, function(result){
    return new TypedArrayConstructor(result.value).subarray(0, result.newLength);
  }, done);
};

WrappedTypedArray.prototype.reduce = function(reducer, seed, identity, done) {
  var TypedArrayConstructor = this.source.constructor;
  this.__operationSkeleton(reducer, operation_names.REDUCE, function(result){
    return new TypedArrayConstructor(result.value).subarray(0, result.newLength);
  }, function (result) {
    var r = Array.prototype.slice.call(result).reduce(reducer, seed);
    done(r);
  }, identity);
};

module.exports = WrappedTypedArray;