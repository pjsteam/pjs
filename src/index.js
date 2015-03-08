var errors = require('./errors');
var utils = require('./utils');
var JobPackager = require('./job_packager');
var ResultCollector = require('./result_collector');
var merge_typed_arrays = require('./typed_array_merger');
var work = require('webworkify');
var operation_names = require('./operation_names');
var pjs;

var initialized = false;
var workers = [];

var WrappedTypedArray = function(source, parts){
	this.packager = new JobPackager(parts, source);
	this.source = source;
	this.parts = parts;
};

WrappedTypedArray.prototype.__operationSkeleton = function (f, operation, collectorMapper, done, identity) {
	var packs = this.packager.generatePackages(f, operation, identity);
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