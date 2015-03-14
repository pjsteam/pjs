var JobPackager = require('./job_packager');
var ResultCollector = require('./result_collector');
var merge_typed_arrays = require('./typed_array_merger');
var utils = require('./utils');
var operation_names = require('./operation_names');

var Skeleton = function (source, parts, workers, operationName, code, seed, identity) {
  this.packager = new JobPackager(parts, source);
  this.source = source;
  this.parts = parts;
  this.workers = workers;
  this.operationName = operationName;
  this.code = code;
  this.seed = seed;
  this.identity = identity;
};

Skeleton.prototype.map = function() {

};

Skeleton.prototype.filter = function() {

};

Skeleton.prototype.reduce = function() {

};

Skeleton.prototype.seq = function (done) {
  var self = this;
  var workers = this.workers;
  var TypedArrayConstructor = this.source.constructor;
  var packs = this.packager.generatePackages([{ code: this.code, name: this.operationName, identity: this.identity}]);
  var collector = new ResultCollector(this.parts, function(results){
    var partial_results = results.map(function(result){
      return new TypedArrayConstructor(result.value).subarray(0, result.newLength);
    });
    var m = merge_typed_arrays(partial_results);
    return self.__finish(self, m, done);
  });

  packs.forEach(function(pack, index){
    utils.listenOnce(workers[index], 'message', function(event){
      collector.onPart(event.data);
    });

    workers[index].postMessage(pack, [ pack.buffer ]);
  });
};

Skeleton.prototype.__finish = function(self, result, done) {
  if (self.operationName === operation_names.REDUCE) {
    var r = Array.prototype.slice.call(result).reduce(self.code, self.seed);
    done(r);
  } else {
    done(result);
  }
};

module.exports = Skeleton;