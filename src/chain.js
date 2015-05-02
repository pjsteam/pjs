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
    } else {
      resolve(result);
    }
  },
  filter: function (self, result, done, resolve) {
    if (done) {
      done(null, result);
    } else {
      resolve(result);
    }
  },
  reduce: function (self, result, done, resolve) {
    var context = immutableExtend(self.globalContext, self.__localContext());
    var operation = self.operation;
    var code = operation.identityCode;
    var r = operation.seed, i = 0;
    var resultLength = result.length;
    for ( ; i < resultLength; i++) {
      r = code(r, result[i], context);
    }
    if (done) {
      done(null, r);
    } else {
      resolve(r);
    }
  }
};

var Chain = function (options) {
  this.packager = new JobPackager(options.parts, options.source);
  this.source = options.source;
  this.parts = options.parts;
  this.operation = options.operation; //todo: (mati) por ahora lo dejo para finalizar el reduce correctamente
  this.globalContext = options.globalContext;
  this.chainContext = options.chainContext;
  var previousOperations = options.previousOperations || [];
  previousOperations.push(options.operation);
  this.operations = previousOperations;
  this.depth = options.depth || 0;
};

Chain.prototype.__localContext = function () {
  return contextUtils.contextFromChainContext(this.depth, this.chainContext);
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
  var nextDepth = oldChain.depth + 1;
  var extendChainContext = contextUtils.extendChainContext(nextDepth, options.localContext, oldChain.chainContext);
  var operation = operation_packager(options.operation, options.f, options.seed, options.identity, options.identityReducer);
  var opt = {
    source: oldChain.source,
    parts: oldChain.parts,
    operation: operation,
    globalContext: oldChain.globalContext,
    chainContext: extendChainContext,
    previousOperations: oldChain.operations,
    depth: nextDepth
  };
  return new Chain(opt);
}

Chain.prototype.seq = function (done) {
  var self = this;
  return new Promise(function (resolve, reject) {
    var packs = self.packager.generatePackages(self.operations, self.chainContext);

    workers.sendPacks(packs, function(err, results){
      if (err) { if (done) { done(err); } else { reject(err); } return; }
      var m;
      var type = packs[0].elementsType;
      if (self.__shouldMergeSeparatedBuffers(type, self.operations)) {
        var partial_results = results.map(function(result){
          var start = result.start;
          var end = result.newEnd;
          var temp = utils.createTypedArray(type, result.value);
          return temp.subarray(start, end);
        });
        m = merge_typed_arrays(partial_results);
      } else {
        m = utils.createTypedArray(type, results[0].value);
      }
      return finisher[self.operation.name](self, m, done, resolve);
    });
  });
};

Chain.prototype.__verifyPreviousOperation = function () {
  if (this.operation.name === 'reduce') {
    throw new errors.InvalidOperationError(errors.messages.INVALID_CHAINING_OPERATION);
  }
};

Chain.prototype.__shouldMergeSeparatedBuffers = function (typedArrayType, operations) {
  if (typedArrayType.indexOf('Shared') > -1) {
    return this.__arrayReducerOperationWasApplied(operations);
  }
  return true;
};

Chain.prototype.__arrayReducerOperationWasApplied = function (operations) {
  var i;
  var length = operations.length;
  for (i = 0; i < length; i += 1) {
    var operation = operations[i];
    if (operation.name !== operation_names.MAP) {
      return true;
    }
  }
  return false;
};

module.exports = Chain;
