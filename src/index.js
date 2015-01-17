var pjs = module.exports = {};

var errors = require('./errors.js');

var initialized = false;
var workers; 

function _init(options) {

	if (initialized) {
		throw new errors.InvalidOperationError('You should not recall init if the library is already initialized.');
	}

	var cpus = navigator.hardwareConcurrency || 1;
	options = options || {};
	var maxWorkers = options.maxWorkers || cpus;

	var workersCount = Math.min(maxWorkers, cpus);

    var config = {
    	get workers () {
    		return workersCount;
    	}
    };

	generateGetter(pjs, 'config', config);

	workers = ((function (){
		var items = [];
		var i = pjs.config.workers;
		var wCode = function (event) {
			//todo
			postMessage(null);
		};
		var blob = new Blob(["onmessage = " + wCode.toString()]);
		var blobURL = window.URL.createObjectURL(blob);
		for (; i--;) {
			var worker = new Worker(blobURL);
			items.push(worker);
		}
		return items;
	})());

	initialized = true;
}

function _terminate() {
	if (!initialized) {
		throw new errors.InvalidOperationError('You should not terminate pjs if it was not initialized before.');
	}

	var i = workers.length;
	workers.forEach(function (w) {
		w.terminate();
	});
	workers = undefined;
	delete(pjs.config);

	initialized = false;
};

var generateGetter = function (obj, name, getter) {
	Object.defineProperty(obj, name, {
		enumerable: true,
		configurable: true,
		get: function () { 
			return getter;
		}
	});
};

generateGetter(pjs, 'init', _init);
generateGetter(pjs, 'terminate', _terminate);