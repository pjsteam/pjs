var pjs = module.exports = function wrap(typedArray){
	if (!utils.isTypedArray(typedArray)) {
		throw new errors.InvalidArgumentsError(errors.messages.INVALID_TYPED_ARRAY);
	}
	return {
		map: map.bind(null, pjs, typedArray)
	};
};

var errors = require('./errors.js');
var utils = require('./utils.js');
var JobPackager = require('./job_packager.js');
var ResultCollector = require('./result_collector.js');
var merge_typed_arrays = require('./typed_array_merger.js');
var work = require('webworkify');

var initialized = false;
var workers = [];

function map(pjs, typedArray, mapper, done){
	var parts = pjs.config.workers;

	var packager = new JobPackager(parts, mapper, typedArray);
	var packs = packager.generatePackages();
	var TypedArrayConstructor = typedArray.constructor;

	var collector = new ResultCollector(parts, function(buffers){
		var partial_results = buffers.map(function(buffer){
			return new TypedArrayConstructor(buffer);
		});

		var result = merge_typed_arrays(partial_results);
		return done(result);
	});

	packs.forEach(function(pack, index){
		workers[index].addEventListener('message', function(event){
			collector.onPart(event.data);
		});

		workers[index].postMessage(pack, [ pack.buffer ]);
	});
}

pjs.init = function (options) {
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
};

pjs.terminate = function() {
	if (!initialized) {
		throw new errors.InvalidOperationError(errors.messages.TERMINATE_WITHOUT_INIT);
	}

	workers.forEach(function (w) { w.terminate(); });
	workers = [];
	delete pjs.config;

	initialized = false;
};