var JobPackager = require('./job_packager');
var ResultCollector = require('./result_collector');
var merge_typed_arrays = require('./typed_array_merger');
var operation_names = require('./operation_names');
var operation_packager = require('./operation_packager');
var errors = require('./errors');

var finisher = {
  map: function (self, result, done) {
    done(null, result);
  },
  filter: function (self, result, done) {
    done(null, result);
  },
  reduce: function (self, result, done) {
    var r = Array.prototype.slice.call(result).reduce(self.operation.code, self.operation.seed);
    done(null, r);
  }
};

var Skeleton = function (source, parts, workers, operation, previousOperations) {
  this.packager = new JobPackager(parts, source);
  this.source = source;
  this.parts = parts;
  this.workers = workers;
  this.operation = operation; //todo: (mati) por ahora lo dejo para finalizar el reduce correctamente
  previousOperations = previousOperations || [];
  previousOperations.push(operation);
  this.operations = previousOperations;
};

Skeleton.prototype.map = function (mapper) {
  this.__verifyPreviousOperation();
  var operation = operation_packager(operation_names.MAP, mapper);
  return new Skeleton(this.source, this.parts, this.workers, operation, this.operations);
};

Skeleton.prototype.filter = function (predicate) {
  this.__verifyPreviousOperation();
  var operation = operation_packager(operation_names.FILTER, predicate);
  return new Skeleton(this.source, this.parts, this.workers, operation, this.operations);
};

Skeleton.prototype.reduce = function (predicate, seed, identity) {
  this.__verifyPreviousOperation();
  var operation = operation_packager(operation_names.REDUCE, predicate, seed, identity);
  return new Skeleton(this.source, this.parts, this.workers, operation, this.operations);
};

Skeleton.prototype.seq = function (done) {
  var self = this;
  var workers = this.workers;
  var TypedArrayConstructor = this.source.constructor;
  var packs = this.packager.generatePackages(this.operations);
  var collector = new ResultCollector(this.parts, function(err, results){
    if (err) { return done(err); }
    var partial_results = results.map(function(result){
      return new TypedArrayConstructor(result.value).subarray(0, result.newLength);
    });
    var m = merge_typed_arrays(partial_results);
    return finisher[self.operation.name](self, m, done);
  });

  packs.forEach(function(pack, index){
    var onMessageHandler = function (event){
      event.target.removeEventListener('error', onErrorHandler);
      event.target.removeEventListener('message', onMessageHandler);
      return collector.onPart(event.data);
    };

    var onErrorHandler = function (event){
      event.target.removeEventListener('error', onErrorHandler);
      event.target.removeEventListener('message', onMessageHandler);
      return collector.onError(event.message);
    };

    workers[index].addEventListener('error', onErrorHandler);
    workers[index].addEventListener('message', onMessageHandler);

    workers[index].postMessage(pack, [ pack.buffer ]);
  });
};

Skeleton.prototype.__verifyPreviousOperation = function () {
  if (this.operation.name === 'reduce') {
    throw new errors.InvalidOperationError(errors.messages.INVALID_CHAINING_OPERATION);
  }
};

module.exports = Skeleton;