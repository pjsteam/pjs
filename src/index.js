module.exports = ((function () {

	var errors = require('./errors.js');
	console.log(errors);
	var pjs = {};
	var workers; 

	function _init(options) {
		var cpus = navigator.hardwareConcurrency || 1;
		options = options || {};
		var maxWorkers = options.maxWorkers || cpus;

		var workersCount = Math.min(maxWorkers, cpus);

        var config = {
        	get workers () {
        		return workersCount;
        	}
        };

		Object.defineProperty(pjs, 'config', {
			enumerable: true,
			configurable: true,
			get: function () { 
				return config;
			}
		});

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

		pjs.init = function () {
			throw new errors.InvalidOperationError('You should not call consecutives init without calling terminate in the middle.');
		};
		pjs.terminate = _terminate;
	}

	function _terminate() {
		var i = workers.length;
		workers.forEach(function (w) {
			w.terminate();
		});
		workers = undefined;
		delete(pjs.config);
		pjs.init = _init;
		pjs.terminate = function () {};
	};

	pjs.init = _init;
	pjs.terminate = function () {};

	return pjs;
})());