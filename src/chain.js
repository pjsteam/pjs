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
  map: function (self, result, done, resolve) {
    if (done) {
      done(null, result);
    }
    resolve(result);
  },
  filter: function (self, result, done, resolve) {
    if (done) {
      done(null, result);
    }
    resolve(result);
  },
  reduce: function (self, result, done, resolve) {
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
    if (done) {
      done(null, r);
    }
    resolve(r);
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
  return createChain(this, {
    localContext: localContext,
    f: mapper,
    operation: operation_names.MAP
  });
};

Chain.prototype.filter = function (predicate, localContext) {
  return createChain(this, {
    localContext: localContext,
    f: predicate,
    operation: operation_names.FILTER
  });
};

Chain.prototype.reduce = function (reducer, seed, identityReducer, identity, localContext) {
  if (!utils.isFunction(identityReducer)) {
    localContext = identity;
    identity = identityReducer;
    identityReducer = reducer;
  }

  return createChain(this, {
    localContext: localContext,
    f: reducer,
    seed: seed,
    identity: identity,
    identityReducer: identityReducer,
    operation: operation_names.REDUCE
  });
};

function createChain(oldChain, options){
  oldChain.__verifyPreviousOperation();
  var extendChainContext = contextUtils.extendChainContext(options.localContext, oldChain.chainContext);
  var operation = operation_packager(options.operation, options.f, options.seed, options.identity, options.identityReducer);
  return new Chain(oldChain.source, oldChain.parts, operation, oldChain.globalContext, extendChainContext, oldChain.operations);
}

Chain.prototype.seq = function (done) {
  var self = this;
  return new Promise(function (resolve, reject) {
    var TypedArrayConstructor = self.source.constructor;
    var packs = self.packager.generatePackages(self.operations, self.chainContext);

    workers.sendPacks(packs, function(err, results){
      if (err) { if (done) { done(err); } reject(err); return; }
      var partial_results = results.map(function(result){
        return new TypedArrayConstructor(result.value).subarray(0, result.newLength);
      });
      var m = merge_typed_arrays(partial_results);
      return finisher[self.operation.name](self, m, done, resolve);
    });
  });
};

Chain.prototype.__verifyPreviousOperation = function () {
  if (this.operation.name === 'reduce') {
    throw new errors.InvalidOperationError(errors.messages.INVALID_CHAINING_OPERATION);
  }
};

module.exports = Chain;
