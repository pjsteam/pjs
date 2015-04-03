var JobPackager = require('./job_packager');
var workers = require('./workers');
var merge_typed_arrays = require('./typed_array_merger');
var operation_names = require('./operation_names');
var operation_packager = require('./operation_packager');
var errors = require('./errors');
var utils = require('./utils');
var contextUtils = require('./chain_context');
var immutableExtend = require('xtend/immutable');

var finisher = {
  map: function (self, result, done) {
    done(null, result);
  },
  filter: function (self, result, done) {
    done(null, result);
  },
  reduce: function (self, result, done) {
    var r;
    var context = immutableExtend(self.globalContext, self.__localContext());
    var operation = self.operation;
    var code = operation.identityCode;
    var seed = operation.seed;
    if (context) {
      r = Array.prototype.slice.call(result).reduce(function (p, e) {
        return code(p, e, context);
      }, seed);
    } else {
      r = Array.prototype.slice.call(result).reduce(code, seed);
    }
    done(null, r);
  }
};

var Chain = function (source, parts, operation, globalContext, chainContext, previousOperations) {
  this.packager = new JobPackager(parts, source);
  this.source = source;
  this.parts = parts;
  this.operation = operation; //todo: (mati) por ahora lo dejo para finalizar el reduce correctamente
  this.globalContext = globalContext;
  this.chainContext = chainContext;
  previousOperations = previousOperations || [];
  previousOperations.push(operation);
  this.operations = previousOperations;
};

Chain.prototype.__localContext = function () {
  return contextUtils.currentContextFromChainContext(this.chainContext);
};

Chain.prototype.map = function (mapper, localContext) {
  this.__verifyPreviousOperation();
  var extendChainContext = contextUtils.extendChainContext(localContext, this.chainContext);
  var operation = operation_packager(operation_names.MAP, mapper);
  return new Chain(this.source, this.parts, operation, this.globalContext, extendChainContext, this.operations);
};

Chain.prototype.filter = function (predicate, localContext) {
  this.__verifyPreviousOperation();
  var extendChainContext = contextUtils.extendChainContext(localContext, this.chainContext);
  var operation = operation_packager(operation_names.FILTER, predicate);
  return new Chain(this.source, this.parts, operation, this.globalContext, extendChainContext, this.operations);
};

Chain.prototype.reduce = function (reducer, seed, identityReducer, identity, localContext) {
  if (!utils.isFunction(identityReducer)) {
    localContext = identity;
    identity = identityReducer;
    identityReducer = reducer;
  }
  this.__verifyPreviousOperation();
  var extendChainContext = contextUtils.extendChainContext(localContext, this.chainContext);
  var operation = operation_packager(operation_names.REDUCE, reducer, seed, identity, identityReducer);
  return new Chain(this.source, this.parts, operation, this.globalContext, extendChainContext, this.operations);
};

Chain.prototype.seq = function (done) {
  var self = this;
  var TypedArrayConstructor = this.source.constructor;
  var packs = this.packager.generatePackages(this.operations, this.chainContext);

  workers.sendPacks(packs, function(err, results){
    if (err) { return done(err); }
    var partial_results = results.map(function(result){
      return new TypedArrayConstructor(result.value).subarray(0, result.newLength);
    });
    var m = merge_typed_arrays(partial_results);
    return finisher[self.operation.name](self, m, done);
  });
};

Chain.prototype.__verifyPreviousOperation = function () {
  if (this.operation.name === 'reduce') {
    throw new errors.InvalidOperationError(errors.messages.INVALID_CHAINING_OPERATION);
  }
};

module.exports = Chain;
