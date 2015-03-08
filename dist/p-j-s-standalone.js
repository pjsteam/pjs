!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.pJS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn) {
    var keys = [];
    var wkey;
    var cacheKeys = Object.keys(cache);
    
    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        if (cache[key].exports === fn) {
            wkey = key;
            break;
        }
    }
    
    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
    
    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'],'require(' + stringify(wkey) + ')(self)'),
        scache
    ];
    
    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;
    
    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    
    return new Worker(URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};

},{}],2:[function(require,module,exports){
var errors = module.exports = {};

var InvalidOperationError = function InvalidOperationError(message) {
	this.name = 'InvalidOperationError';
	this.message = message || 'Invalid Operation';
};

InvalidOperationError.prototype = new Error();
InvalidOperationError.prototype.constructor = InvalidOperationError;
errors.InvalidOperationError = InvalidOperationError;


var InvalidArgumentsError = function InvalidArgumentsError(message) {
  this.name = 'InvalidArgumentsError';
  this.message = message || 'Invalid Arguments';
};

InvalidArgumentsError.prototype = new Error();
InvalidArgumentsError.prototype.constructor = InvalidArgumentsError;
errors.InvalidArgumentsError = InvalidArgumentsError;

errors.messages = {
  CONSECUTIVE_INITS: 'You should not recall init if the library is already initialized.',
  TERMINATE_WITHOUT_INIT: 'You should not terminate pjs if it was not initialized before.',
  PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY: 'Expected TypedArray argument.',
  ZERO_ARRAYS_TO_MERGE: 'Zero arrays to merge. Provide at least one.',
  INVALID_PARTS: 'Invalid number of parts.',
  PART_ALREADY_COLLECTED: 'Tried to collect part {0} more than once',
  INVALID_CODE: 'Invalid code argument to package.',
  INVALID_ELEMENTS: 'Invalid number of elements to package.',
  INVALID_PACKAGE_INDEX: 'Package index should be not negative and less than {0}.',
  INVALID_TYPED_ARRAY: 'Invalid argument. It should be of TypedArray',
  INVALID_OPERATION: 'Invalid pjs operation. Possible values are \'filter\' or \'map\''
};

},{}],3:[function(require,module,exports){
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

WrappedTypedArray.prototype.__operationSkeleton = function (f, operation, collectorMapper, done) {
	var packs = this.packager.generatePackages(f, operation);
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
},{"./errors":2,"./job_packager":4,"./operation_names":5,"./result_collector":6,"./typed_array_merger":7,"./utils":9,"./worker.js":10,"webworkify":1}],4:[function(require,module,exports){
var errors = require('./errors.js');
var utils = require('./utils.js');
var Partitioner = require('./typed_array_partitioner.js');
var operation_names = require('./operation_names');

var FUNCTION_REGEX = /^function[^(]*\(([^)]*)\)[^{]*\{([\s\S]*)\}$/;

var operations = Object.keys(operation_names).map(function (k) {
  return operation_names[k];
});

var JobPackager = module.exports = function (parts, elements) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  if (!elements) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_ELEMENTS);
  }
  this.parts = parts;
  this.elements = elements;
};

JobPackager.prototype.generatePackages = function (code, operation) {
  if (!code) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
  }
  if (!operation || -1 === operations.indexOf(operation)) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
  }
  var functionString = code.toString();
  var match = functionString.match(FUNCTION_REGEX);
  var packageCodeArg = match[1].split(',')[0].trim();
  var packageCode = match[2];
  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);

  return partitionedElements.map(function (partitionedElement, index) {
    return {
      index: index,
      arg: packageCodeArg,
      code: packageCode,
      buffer: partitionedElement.buffer,
      elementsType: elementsType,
      operation: operation
    };
  });
};

},{"./errors.js":2,"./operation_names":5,"./typed_array_partitioner.js":8,"./utils.js":9}],5:[function(require,module,exports){
module.exports = {
  MAP: 'map',
  FILTER: 'filter'
};
},{}],6:[function(require,module,exports){
var errors = require('./errors.js');
var utils = require('./utils.js');

var Collector = module.exports = function (parts, cb) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }

  if (!cb){
    throw new errors.InvalidArgumentsError(errors.messages.MISSING_CALLBACK);
  }
  this.cb = cb;
  this.parts = parts;
  this.collected = new Array(parts);
  this.completed = 0;
};

Collector.prototype.onPart = function (data){
  if (this.collected[data.index]) {
    throw new errors.InvalidArgumentsError(
      utils.format(errors.messages.PART_ALREADY_COLLECTED, data.index));
  }

  this.collected[data.index] = {value: data.value, newLength: data.newLength} ;
  if (++this.completed === this.parts) {
    return this.cb(this.collected);
  }
};
},{"./errors.js":2,"./utils.js":9}],7:[function(require,module,exports){
var errors = require('./errors.js');

module.exports = function merge(arrays){
  if (!arrays.length) { throw new errors.InvalidArgumentsError(
    errors.messages.ZERO_ARRAYS_TO_MERGE);
  }
  var first = arrays[0];

  if (arrays.length === 1){
    return first;
  }

  var total = arrays.reduce(function(c,a) { return c + a.length; }, 0);
  var result = new first.constructor(total);
  var start = 0;

  for (var i = 0; i < arrays.length; i++) {
    var array = arrays[i];
    result.set(array, start);
    start += array.length;
  }

  return result;
};
},{"./errors.js":2}],8:[function(require,module,exports){
var utils = require('./utils.js');
var errors = require('./errors.js');

var typedArraySlice = function (array, from, to) {
  var subXs = array.subarray(from, to);
  return new array.constructor(subXs);
};

var Partitioner = module.exports = function (parts) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  this.parts = parts;
};

Partitioner.prototype.constructor = Partitioner;

Partitioner.prototype.partition = function (array) {
  this.validateTypedArray(array);
  return this.doPartition(array, this);
};

Partitioner.prototype.validateTypedArray = function (array) {
  if (!utils.isTypedArray(array)) {
    var message = utils.format('Invalid type {0}. {1}', array, errors.messages.PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY);
    throw new errors.InvalidArgumentsError(message);
  }
};

Partitioner.prototype.doPartition = function (array) {
  var parts = this.parts;
  var elementsCount = array.length;
  var subElementsCount = (elementsCount / parts) | 0;
  var from = 0;
  var to = 0;

  var arrays = new Array(parts);
  for (var i = 0; i < parts; i++) {
    if (parts - 1 === i) {
      to = elementsCount;
    } else {
      to += subElementsCount;
    }
    arrays[i] = typedArraySlice(array, from, to);
    from += subElementsCount;
  }
  return arrays;
};

},{"./errors.js":2,"./utils.js":9}],9:[function(require,module,exports){
var utils = module.exports = {};

utils.getter = function (obj, name, value) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    configurable: true,
    get: function () {
      return value;
    }
  });
};

utils.isTypedArray = function (obj) {
  if (!obj) {
    return false;
  }
  var type = utils.getTypedArrayType(obj);
  switch(type){
    case 'Uint8Array':
    case 'Int8Array':
    case 'Uint8ClampedArray':
    case 'Uint16Array':
    case 'Int16Array':
    case 'Uint32Array':
    case 'Int32Array':
    case 'Float32Array':
    case 'Float64Array':
      return true;
    default:
      return false;
  }
};

utils.getTypedArrayConstructorType = function(array) {
  var temp = array.toString();
  return temp.substring('function '.length, temp.length - '() { [native code] }'.length);
};

utils.getTypedArrayType = function(array) {
  var temp = array.toString();
  return temp.substring('[object '.length, temp.length - 1);
};

utils.format = function (template) {
  var toReplace = Array.prototype.slice.call(arguments, 1);
  var current = template;
  for (var i = 0; i < toReplace.length; i++) {
    current = current.replace('{' + i + '}', toReplace[i]);
  }
  return current;
};

utils.listenOnce = function(eventSource, eventName, callback){
  eventSource.addEventListener(eventName, function messageHandler(event){
    event.target.removeEventListener(eventName, messageHandler);
    return callback(event);
  });
};

},{}],10:[function(require,module,exports){
var worker_core = require('./worker_core');

module.exports = function (self) {
  self.addEventListener('message', function (event){
    var result = worker_core(event);

    self.postMessage(result.message, result.transferables);
  });
};
},{"./worker_core":11}],11:[function(require,module,exports){
// param can be either length (number) or buffer
function createTypedArray(type, param){
  switch(type){
    case 'Uint8Array':
      return new Uint8Array(param);
    case 'Uint8ClampedArray':
      return new Uint8ClampedArray(param);
    case 'Uint16Array':
      return new Uint16Array(param);
    case 'Uint32Array':
      return new Uint32Array(param);
    case 'Int8Array':
      return new Int8Array(param);
    case 'Int16Array':
      return new Int16Array(param);
    case 'Int32Array':
      return new Int32Array(param);
    case 'Float32Array':
      return new Float32Array(param);
    case 'Float64Array':
      return new Float64Array(param);
  }
}

function getMapFactory(){
  if (typeof Map === 'function'){
    return function(){
      /* jshint ignore:start */
      return new Map();
      /* jshint ignore:end */
    };
  } else {
    return function(){
      return Object.create(null);
    };
  }
}

var mapFactory = getMapFactory();

var functionCache = mapFactory();

var operations = {
  map: function (array, f) {
    var i = array.length;
    for ( ; i--; ){
      array[i] = f(array[i]);
    }
    return array.length;
  },
  filter: function (array, f) {
    var l = array.length;
    var i = 0, newLength = 0;
    for ( ; i < l; i += 1){
      var e = array[i];
      if (f(e)) {
        array[newLength++] = e;
      }
    }
    return newLength;
  }
};

module.exports = function(event){
  var pack = event.data;
  var arg = pack.arg;
  var code = pack.code;
  var cacheKey = arg + code;
  var f = functionCache[cacheKey];
  if (!f){
    /*jslint evil: true */
    f = new Function(arg, code);
    functionCache[cacheKey] = f;
  }

  var array = createTypedArray(pack.elementsType, pack.buffer);

  var newLength = operations[pack.operation](array, f);
  
  return {
    message: {
      index: pack.index,
      value: array.buffer,
      newLength: newLength
    },
    transferables: [ array.buffer ]
  };
};

},{}]},{},[3])(3)
});