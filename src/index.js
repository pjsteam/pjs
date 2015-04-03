var errors = require('./errors');
var utils = require('./utils');
var work = require('webworkify');
var WrappedTypedArray = require('./wrapped_typed_array');
var ContextUpdatePackager = require('./context_update_packager');
var ResultCollector = require('./result_collector');
var mutableExtend = require('xtend/mutable');
var pjs;

var initialized = false;
var workers = [];
var globalContext = {};

function wrap(typedArray){
	if (!utils.isTypedArray(typedArray)) {
		throw new errors.InvalidArgumentsError(errors.messages.INVALID_TYPED_ARRAY);
	}
	return new WrappedTypedArray(typedArray, pjs.config.workers, workers, globalContext);
}

function init(options) {
	if (initialized) {
		throw new errors.InvalidOperationError(errors.messages.CONSECUTIVE_INITS);
	}

	options = options || {};
	var cpus = navigator.hardwareConcurrency || 1;
	var maxWorkers = options.maxWorkers || cpus;
	var workersCount = Math.min(maxWorkers, cpus);

	while (workersCount--) {
		var worker = work(require('./worker.js'));
		workers.push(worker);
	}

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
  var packs = this.contextUpdatePackager.generatePackages(updates);
  var collector = new ResultCollector(workers.length, function(err){
    if (err) { return done(err); }
    mutableExtend(globalContext, updates);
    done();
  });

	packs.forEach(function(pack, index){
    var onMessageHandler = function (event){
      event.target.removeEventListener('error', onErrorHandler);
      event.target.removeEventListener('message', onMessageHandler);
      return collector.onPart(event.data);
    };

    var onErrorHandler = function (event){
      event.preventDefault();
      event.target.removeEventListener('error', onErrorHandler);
      event.target.removeEventListener('message', onMessageHandler);
      return collector.onError(event.message);
    };

    workers[index].addEventListener('error', onErrorHandler);
    workers[index].addEventListener('message', onMessageHandler);

    workers[index].postMessage(pack);
  });
}

function terminate() {
	if (!initialized) {
		throw new errors.InvalidOperationError(errors.messages.TERMINATE_WITHOUT_INIT);
	}

	workers.forEach(function (w) { w.terminate(); });
	workers = [];
  globalContext = {};
	delete pjs.config;
	delete pjs.contextUpdatePackager;

	initialized = false;
}

pjs = module.exports = wrap;

pjs.init = init;
pjs.terminate = terminate;
pjs.updateContext = updateContext;