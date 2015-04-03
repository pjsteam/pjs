var errors = require('./errors');
var utils = require('./utils');
var workers = require('./workers');
var WrappedTypedArray = require('./wrapped_typed_array');
var ContextUpdatePackager = require('./context_update_packager');
var mutableExtend = require('xtend/mutable');
var pjs;

var initialized = false;
var globalContext = {};

function wrap(typedArray){
	if (!utils.isTypedArray(typedArray)) {
		throw new errors.InvalidArgumentsError(errors.messages.INVALID_TYPED_ARRAY);
	}
	return new WrappedTypedArray(typedArray, workers.length, globalContext);
}

function init(options) {
	if (initialized) {
		throw new errors.InvalidOperationError(errors.messages.CONSECUTIVE_INITS);
	}

	options = options || {};
	var cpus = navigator.hardwareConcurrency || 1;
	var maxWorkers = options.maxWorkers || cpus;
	var workersCount = Math.min(maxWorkers, cpus);
  workers.init(workersCount);

	var config = {
  	get workers () {
  		return workers.length;
  	}
  };

  utils.getter(pjs, 'config', config);
  utils.getter(pjs, 'contextUpdatePackager', new ContextUpdatePackager(workers.length));

	initialized = true;
}

function updateContext(updates, done){
  var self = this;
  return new Promise(function (resolve, reject) {
    var packs = self.contextUpdatePackager.generatePackages(updates);
    workers.sendPacks(packs, function(err){
      if (err) { if (done) { done(err); } reject(err); return; }
      mutableExtend(globalContext, updates);
      if (done) {
        done();
      }
      resolve();
    });
  });
}

function terminate() {
	if (!initialized) {
		throw new errors.InvalidOperationError(errors.messages.TERMINATE_WITHOUT_INIT);
	}

  workers.terminate();

  globalContext = {};
	delete pjs.config;
	delete pjs.contextUpdatePackager;

	initialized = false;
}

pjs = module.exports = wrap;

pjs.init = init;
pjs.terminate = terminate;
pjs.updateContext = updateContext;