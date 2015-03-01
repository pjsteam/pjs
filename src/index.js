var errors = require('./errors.js');
var utils = require('./utils.js');
var JobPackager = require('./job_packager.js');
var ResultCollector = require('./result_collector.js');
var merge_typed_arrays = require('./typed_array_merger.js');
var work = require('webworkify');
var pjs;

var initialized = false;
var workers = [];

var WrappedTypedArray = function(source, parts){
	this.source = source;
	this.parts = parts;
};

WrappedTypedArray.prototype.__operationSkeleton = function (f, operation, collectorMapper, done) {
	var packager = new JobPackager(this.parts, f, this.source, operation);
	var packs = packager.generatePackages();

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
	this.__operationSkeleton(mapper, 'map', function(result){
		return new TypedArrayConstructor(result.value);
	}, done);
};

WrappedTypedArray.prototype.filter = function(predicate, done) {
	var TypedArrayConstructor = this.source.constructor;
	this.__operationSkeleton(predicate, 'filter', function(result){
		return new TypedArrayConstructor(result.value).subarray(0, result.newLength);
	}, done);
};

function wrap(typedArray){
	if (!utils.isTypedArray(typedArray)) {
		throw new errors.InvalidArgumentsError(errors.messages.INVALID_TYPED_ARRAY);
	}

	return new WrappedTypedArray(typedArray, pjs.config.workers);
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

	initialized = true;
}

function terminate() {
	if (!initialized) {
		throw new errors.InvalidOperationError(errors.messages.TERMINATE_WITHOUT_INIT);
	}

	workers.forEach(function (w) { w.terminate(); });
	workers = [];
	delete pjs.config;

	initialized = false;
}

pjs = module.exports = wrap;

pjs.init = init;
pjs.terminate = terminate;