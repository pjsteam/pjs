require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],3:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],4:[function(require,module,exports){
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
  this.operation = options.operation;
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
    previousOperations: oldChain.operations.slice(),
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
      var finalResult;
      var firstPack = packs[0];
      var type = firstPack.elementsType;
      if (self.__shouldMergeSeparatedBuffers(type, self.operations)) {
        var partial_results = results.map(function(result){
          var start = result.start;
          var end = result.newEnd;
          var temp = utils.createTypedArray(type, result.value || firstPack.targetBuffer);
          return temp.subarray(start, end);
        });
        finalResult = merge_typed_arrays(partial_results);
      } else {
        finalResult = utils.createTypedArray(type, results[0].value || firstPack.targetBuffer);
      }
      return finisher[self.operation.name](self, finalResult, done, resolve);
    });
  });
};

Chain.prototype.__verifyPreviousOperation = function () {
  if (this.operation.name === 'reduce') {
    throw new errors.InvalidOperationError(errors.messages.INVALID_CHAINING_OPERATION);
  }
};

Chain.prototype.__shouldMergeSeparatedBuffers = function (typedArrayType, operations) {
  if (typedArrayType.indexOf('Shared') === 0) {
    return this.__arrayChangingSizeOperationWasApplied(operations);
  }
  return true;
};

Chain.prototype.__arrayChangingSizeOperationWasApplied = function (operations) {
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

},{"./chain_context":5,"./errors":8,"./job_packager":9,"./operation_names":10,"./operation_packager":11,"./typed_array_merger":13,"./utils":15,"./workers":18,"xtend/immutable":2}],5:[function(require,module,exports){
var contextUtils = require('./context');
var extend = require("xtend");

var chainContext = module.exports = {};

chainContext.serializeChainContext = function (chainContext) {
  return JSON.stringify(chainContext);
};

chainContext.deserializeChainContext = function (chainContext) {
  return JSON.parse(chainContext);
};

chainContext.extendChainContext = function (currentIndex, localContext, chainContext) {
  if (!localContext && !chainContext) {
    return undefined;
  }
  if (!localContext) {
    return extend(chainContext, undefined);
  }
  var nextContext = {};
  nextContext[currentIndex] = contextUtils.serializeFunctions(localContext);
  if (!chainContext) {
    return nextContext;
  }
  return extend(chainContext, nextContext);
};

chainContext.contextFromChainContext = function (currentIndex, chainContext) {
  if (chainContext && chainContext[currentIndex]) {
    return contextUtils.deserializeFunctions(chainContext[currentIndex]);
  }
  return undefined;
};

},{"./context":6,"xtend":2}],6:[function(require,module,exports){
var utils = require('./utils');

var ctx = {};
module.exports = ctx;

ctx.deserializeFunctions = function(obj){
  return Object.keys(obj).reduce(function(c,v){
    var value = obj[v];

    if (utils.isObject(value)){
      if (value.__isFunction){
        c[v] = deserializeFunction(value);
      } else {
        ctx.deserializeFunctions(value);
      }
    }

    return c;
  }, obj);
};

ctx.serializeFunctions = function (obj) {
  var res;
  if (obj) {
    res = Object.keys(obj).reduce(function(c,v){
      var value = obj[v];
      if (utils.isFunction(value)){
        c[v] = serializeFunction(value);
      } else if (utils.isObject(value)){
        c[v] = ctx.serializeFunctions(value);
      } else {
        c[v] = value;
      }

      return c;
    }, {});
  }
  return res;
};

function serializeFunction (value) {
  var parsed = utils.parseFunction(value);
  return {
    __isFunction: true,
    args: parsed.args,
    code: parsed.body
  };
}

function deserializeFunction(value) {
  return utils.createFunction(value.args, value.code);
}
},{"./utils":15}],7:[function(require,module,exports){
var errors = require('./errors');
var contextUtils = require('./context');

var ContextUpdatePackager = module.exports = function (parts) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  this.parts = parts;
};

ContextUpdatePackager.prototype.generatePackages = function (contextUpdate) {
  if (!contextUpdate) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CONTEXT);
  }

  var parts = new Array(this.parts);

  for (var i = 0; i < this.parts; i++) {
    parts[i] = {
      index: i,
      contextUpdate: JSON.stringify(contextUtils.serializeFunctions(contextUpdate))
    };
  }

  return parts;
};

},{"./context":6,"./errors":8}],8:[function(require,module,exports){
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

var WorkerError = function WorkerError(message){
  this.name = 'WorkerError';
  this.message = message || 'An unknown error ocurred in the worker';
};

WorkerError.prototype = new Error();
WorkerError.prototype.constructor = WorkerError;
errors.WorkerError = WorkerError;

errors.messages = {
  CONSECUTIVE_INITS: 'You should not recall init if the library is already initialized.',
  TERMINATE_WITHOUT_INIT: 'You should not terminate pjs if it was not initialized before.',
  PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY: 'Expected TypedArray argument.',
  ZERO_ARRAYS_TO_MERGE: 'Zero arrays to merge. Provide at least one.',
  INVALID_PARTS: 'Invalid number of parts.',
  INVALID_CONTEXT: 'Invalid context.',
  PART_ALREADY_COLLECTED: 'Tried to collect part {0} more than once',
  MISSING_CODE_OR_PATH: 'Missing "code" or "functionPath" argument to package.',
  INVALID_IDENTITY_CODE: 'Invalid identity code argument to package.',
  INVALID_ELEMENTS: 'Invalid number of elements to package.',
  INVALID_PACKAGE_INDEX: 'Package index should be not negative and less than {0}.',
  INVALID_TYPED_ARRAY: 'Invalid argument. It should be of TypedArray.',
  INVALID_OPERATION: 'Invalid pjs operation. Possible values are \'filter\', \'map\' or \'reduce\'.',
  INVALID_OPERATIONS: 'Invalid operation chain sent to JobPackager. Either undefined or empty.',
  MISSING_SEED: 'Missing Seed argument for reduce operation packaging.',
  MISSING_IDENTITY: 'Missing Identity argument for reduce operation packaging.',
  INVALID_CHAINING_OPERATION: 'Can not perform more chaining after reduce operation.'
};

},{}],9:[function(require,module,exports){
var errors = require('./errors');
var utils = require('./utils');
var Partitioner = require('./typed_array_partitioner');
var contextSerializer = require('./chain_context');

var operation_names = require('./operation_names');
operation_names = Object.keys(operation_names).map(function (k) {
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

JobPackager.prototype.generatePackages = function (operations, chainContext) {
  if (!(operations && operations.length)){
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATIONS);
  }

  var parsedOperations = operations.map(function(op){
    if (!(op.code || op.functionPath)) {
      throw new errors.InvalidArgumentsError(errors.messages.MISSING_CODE_OR_PATH);
    }

    if (!op.name || -1 === operation_names.indexOf(op.name)) {
      throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
    }

    if (!op.functionPath){
      var parsed = utils.parseFunction(op.code.toString());

      return {
        identity: op.identity,
        args: parsed.args,
        code: parsed.body,
        name: op.name
      };
    }

    return {
      identity: op.identity,
      name: op.name,
      functionPath: op.functionPath
    };
  });

  var elementsType = utils.getTypedArrayType(this.elements);
  var partitioner = new Partitioner(this.parts);
  var partitionedElements = partitioner.partition(this.elements);
  var isShared = utils.isSharedArray(this.elements);
  var strfyCtx = contextSerializer.serializeChainContext(chainContext);
  return partitionedElements.map(function (partitionedElement, index) {
    var sourceBuffer, targetBuffer, start, to;
    if (isShared) {
      sourceBuffer = partitionedElement.sourceArray.buffer;
      targetBuffer = partitionedElement.sharedArray.buffer;
      start = partitionedElement.from;
      to = partitionedElement.to;
    } else {
      targetBuffer = partitionedElement.buffer;
      start = 0;
      to = partitionedElement.length;
    }
    return {
      index: index,
      start: start,
      end: to,
      sourceBuffer: sourceBuffer,
      targetBuffer: targetBuffer,
      operations: parsedOperations,
      elementsType: elementsType,
      ctx: strfyCtx
    };
  });
};

},{"./chain_context":5,"./errors":8,"./operation_names":10,"./typed_array_partitioner":14,"./utils":15}],10:[function(require,module,exports){
module.exports = {
  MAP: 'map',
  FILTER: 'filter',
  REDUCE: 'reduce'
};
},{}],11:[function(require,module,exports){
var errors = require('./errors');
var utils = require('./utils');
var operation_names = require('./operation_names');
operation_names = Object.keys(operation_names).map(function (k) {
  return operation_names[k];
});

module.exports = function (name, code, seed, identity, identityCode) {
  if (!name || -1 === operation_names.indexOf(name)) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
  }
  if (!code) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
  }
  if (name === 'reduce' && typeof identityCode === 'undefined') {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_IDENTITY_CODE);
  }
  if (name === 'reduce' && typeof seed === 'undefined') {
    throw new errors.InvalidArgumentsError(errors.messages.MISSING_SEED);
  }
  if (name === 'reduce' && typeof identity === 'undefined') {
    throw new errors.InvalidArgumentsError(errors.messages.MISSING_IDENTITY);
  }

  var toReturn = {
    name: name,
    seed: seed,
    identity: identity,
    identityCode: identityCode
  };

  var key = utils.isFunction(code) ? 'code' : 'functionPath';

  toReturn[key] = code;

  return toReturn;
};

},{"./errors":8,"./operation_names":10,"./utils":15}],12:[function(require,module,exports){
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
  this.error = null;
};

Collector.prototype.onError = function(message){
  if (!this.error){
    this.error = new errors.WorkerError(message);
  }
  this.updateCompleted();
};

Collector.prototype.onPart = function (data){
  if (this.error) {
    // we don't care about succesful results if an error ocurred
    return this.updateCompleted();
  }

  if (this.collected[data.index]) {
    throw new errors.InvalidArgumentsError(
      utils.format(errors.messages.PART_ALREADY_COLLECTED, data.index));
  }
  this.collected[data.index] = {value: data.value, start: data.start, newEnd: data.newEnd} ;
  this.updateCompleted();
};

Collector.prototype.updateCompleted = function(){
  if (++this.completed === this.parts){
    if (this.error) {
      return this.cb(this.error);
    }

    return this.cb(null, this.collected);
  }
};
},{"./errors.js":8,"./utils.js":15}],13:[function(require,module,exports){
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
},{"./errors.js":8}],14:[function(require,module,exports){
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
  this.__validateTypedArray(array);
  return this.__doPartition(array, this);
};

Partitioner.prototype.__validateTypedArray = function (array) {
  if (!utils.isTypedArray(array)) {
    var message = utils.format('Invalid type {0}. {1}', array, errors.messages.PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY);
    throw new errors.InvalidArgumentsError(message);
  }
};

Partitioner.prototype.__doPartition = function (array) {
  var parts = this.parts;
  var elementsCount = array.length;
  var subElementsCount = Math.floor(elementsCount / parts) | 0;
  var from = 0;
  var to = 0;
  var isShared = utils.isSharedArray(array);
  var sharedArray;
  var arrays = new Array(parts);
  if (isShared) {
    sharedArray = utils.duplicateTypedArray(array);
  }
  for (var i = 0; i < parts; i++) {
    if (parts - 1 === i) {
      to = elementsCount;
    } else {
      to += subElementsCount;
    }
    if (isShared) {
      arrays[i] = { from:from, to: to, sharedArray: sharedArray, sourceArray: array};
    } else {
      arrays[i] = typedArraySlice(array, from, to);
    }
    from += subElementsCount;
  }
  return arrays;
};
},{"./errors.js":8,"./utils.js":15}],15:[function(require,module,exports){
var utils = module.exports = {};

var FUNCTION_REGEX = /^function[^(]*\(([^)]*)\)[^{]*\{([\s\S]*)\}$/;

utils.parseFunction = function (code) {
  var functionString = code.toString();
  var match = functionString.match(FUNCTION_REGEX);
  var args = match[1].split(',').map(function (p) { return p.trim(); });
  var body = match[2];
  return { args: args, body: body };
};

utils.isObject = function(object){
  return typeof object === 'object' && !Array.isArray(object);
};

utils.isFunction = function (object) { //http://jsperf.com/alternative-isfunction-implementations
  return !!(object && object.constructor && object.call && object.apply);
};

//TODO: (mati) change method's name. It does nt dcuplicate anymore
utils.duplicateTypedArray = function (array) {
  var type = this.getTypedArrayType(array);
  return this.createTypedArray(type, array.length);
};

// param can be either length (number) or buffer
utils.createTypedArray = function(type, param){
  switch(type){
    case 'SharedUint8Array':
      /*global SharedUint8Array */
      return new SharedUint8Array(param);
    case 'SharedUint8ClampedArray':
      /*global SharedUint8ClampedArray */
      return new SharedUint8ClampedArray(param);
    case 'SharedUint16Array':
      /*global SharedUint16Array */
      return new SharedUint16Array(param);
    case 'SharedUint32Array':
      /*global SharedUint32Array */
      return new SharedUint32Array(param);
    case 'SharedInt8Array':
      /*global SharedInt8Array */
      return new SharedInt8Array(param);
    case 'SharedInt16Array':
      /*global SharedInt16Array */
      return new SharedInt16Array(param);
    case 'SharedInt32Array':
      /*global SharedInt32Array */
      return new SharedInt32Array(param);
    case 'SharedFloat32Array':
      /*global SharedFloat32Array */
      return new SharedFloat32Array(param);
    case 'SharedFloat64Array':
      /*global SharedFloat64Array */
      return new SharedFloat64Array(param);
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
};


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
    case 'SharedUint8Array':
    case 'SharedUint8ClampedArray':
    case 'SharedUint16Array':
    case 'SharedUint32Array':
    case 'SharedInt8Array':
    case 'SharedInt16Array':
    case 'SharedInt32Array':
    case 'SharedFloat32Array':
    case 'SharedFloat64Array':
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

utils.isSharedArray = function (obj) {
  if (!obj) {
    return false;
  }
  return utils.getTypedArrayType(obj).indexOf('Shared') === 0;
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

utils.createFunction = function(args, code){
  switch (args.length) {
    case 0:
      /*jslint evil: true */
      return new Function(code);
    case 1:
      /*jslint evil: true */
      return new Function(args[0], code);
    case 2:
      /*jslint evil: true */
      return new Function(args[0], args[1], code);
    case 3:
      /*jslint evil: true */
      return new Function(args[0], args[1], args[2], code);
    case 4:
      /*jslint evil: true */
      return new Function(args[0], args[1], args[2], args[3], code);
    default:
      return createDynamicArgumentsFunction(args, code);
  }
};

var innerGetNested = function(obj, names, index, fail){
  var next = obj[names[index]];
  if (names.length - 1 === index){
    return next;
  }

  if (!utils.isObject(next)){
    fail();
  }

  return innerGetNested(next, names, ++index);
};

utils.getNested = function(obj, path){
  var parts = path.split('.');

  return innerGetNested(obj, parts, 0, function(){
    throw new Error(
      utils.format('Cannot get nested path {0} from context',
        path));
  });
};

function createDynamicArgumentsFunction(args, code) {
  var fArgs = new Array(args);
  fArgs.push(code);
  return Function.prototype.constructor.apply(null, fArgs);
}
},{}],16:[function(require,module,exports){
var worker_core = require('./worker_core');

module.exports = function (self) {
  self.addEventListener('message', function (event){
    var result = worker_core(event);
    if (result.transferables) {
    	self.postMessage(result.message, result.transferables);
    } else {
    	self.postMessage(result.message);
    }
  });
};
},{"./worker_core":17}],17:[function(require,module,exports){
var mutableExtend = require('xtend/mutable');
var utils = require('./utils');
var immutableExtend = require('xtend/immutable');
var contextUtils = require('./context');
var chainContext = require('./chain_context');

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

var globalContext = {};

var operations = {
  map: function (source, target, start, end, f, ctx) {
    var i = start;
    for ( ; i < end; i += 1){
      target[i] = f(source[i], ctx);
    }
    return end;
  },
  filter: function (source, target, start, end, f, ctx) {
    var i = start, newEnd = start;
    for ( ; i < end; i += 1){
      var e = source[i];
      if (f(e, ctx)) {
        target[newEnd++] = e;
      }
    }
    return newEnd;
  },
  reduce: function (source, target, start, end, f, ctx, seed) {
    var i = start;
    var reduced = seed;
    for ( ; i < end; i += 1){
      var e = source[i];
      reduced = f(reduced, e, ctx);
    }
    target[start] = reduced;
    return start + 1;
  }
};

function getFunction(operation){
  if (operation.functionPath){
    return utils.getNested(globalContext, operation.functionPath);
  }

  var args = operation.args;
  var code = operation.code;
  var cacheKey = args.join(',') + code;
  var f = functionCache[cacheKey];
  if (!f){
    f = utils.createFunction(args, code);
    functionCache[cacheKey] = f;
  }

  return f;
}

module.exports = function(event){
  var pack = event.data;

  if (pack.contextUpdate){
    var deserialized = contextUtils.deserializeFunctions(
      JSON.parse(pack.contextUpdate));
    mutableExtend(globalContext, deserialized);

    return {
      message: {
        index: pack.index
      }
    };
  }

  var ops = pack.operations;
  var opsLength = ops.length;
  var context = createOperationContexts(opsLength, pack.ctx);
  var sourceArray;
  var targetArray = utils.createTypedArray(pack.elementsType, pack.targetBuffer);
  if (pack.sourceBuffer) {
    sourceArray = utils.createTypedArray(pack.elementsType, pack.sourceBuffer);
  } else {
    sourceArray = targetArray;
  }
  var start = pack.start;
  var newEnd = pack.end;

  for (var i = 0; i < opsLength; i += 1) {
    var localCtx;
    var operation = ops[i];
    var seed = operation.identity;
    var f = getFunction(operation);

    if (context) {
      localCtx = immutableExtend(globalContext, context[i]);
    } else {
      localCtx = globalContext;
    }
    newEnd = operations[operation.name](sourceArray, targetArray, start, newEnd, f, localCtx, seed);
    sourceArray = targetArray;
  }
  if (pack.sourceBuffer) {
    return {
      message: {
        index: pack.index,
        start: start,
        newEnd: newEnd
      }
    };
  }
  return {
    message: {
      index: pack.index,
      value: targetArray.buffer,
      start: start,
      newEnd: newEnd,
    },
    transferables: [ targetArray.buffer ]
  };
};

function createOperationContexts (operationLength, context) {
  var operationContexts;
  if (context) {
    context = chainContext.deserializeChainContext(context);
    operationContexts = {};
    for (var i = 0; i <= operationLength; i++) {
      if (context[i]){
        operationContexts[i] = contextUtils.deserializeFunctions(context[i]);
      }
    }
  }
  return operationContexts;
}
},{"./chain_context":5,"./context":6,"./utils":15,"xtend/immutable":2,"xtend/mutable":3}],18:[function(require,module,exports){
var ResultCollector = require('./result_collector');
var work = require('webworkify');

var workers = [];
var packQueue;
var sentPack;

Object.defineProperty(module.exports, 'length', {
  get: function(){
    return workers.length;
  }
});

module.exports.init = function(workersCount){
  while (workersCount--) {
    var worker = work(require('./worker.js'));
    workers.push(worker);
  }
  packQueue = [];
  sentPack = undefined;
};

module.exports.terminate = function(){
  workers.forEach(function(w){
    w.terminate();
  });

  workers = [];
  packQueue = undefined;
  sentPack = undefined;
};

module.exports.sendPacks = function(packs, callback){
  packQueue.push({
    packs: packs,
    callback: callback
  });
  sendPacksIfNeeded();
};

function sendPacksIfNeeded() {
  if (!sentPack) {
    sentPack = packQueue.shift();
    if (sentPack) {
      doSendPacks();
    }
  }
}

function doSendPacks() {
  var callback = sentPack.callback;
  var packs = sentPack.packs;
  var collector = new ResultCollector(workers.length, function (err, result) {
    sentPack = undefined;
    callback(err, result);
    sendPacksIfNeeded();
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

    if (pack.targetBuffer){
      if (pack.sourceBuffer) {
        workers[index].postMessage(pack, [ pack.sourceBuffer, pack.targetBuffer ]);
      } else {
        workers[index].postMessage(pack, [ pack.targetBuffer ]);
      }
    } else {
      workers[index].postMessage(pack);
    }
  });
}
},{"./result_collector":12,"./worker.js":16,"webworkify":1}],19:[function(require,module,exports){
var operation_names = require('./operation_names');
var Chain = require('./chain');
var operation_packager = require('./operation_packager');
var contextUtils = require('./chain_context');
var utils = require('./utils');

var WrappedTypedArray = function (source, parts, globalContext) {
  this.source = source;
  this.parts = parts;
  this.globalContext = globalContext;
};

WrappedTypedArray.prototype.map = function(mapper, context) {
  return this.__operation(operation_names.MAP, mapper, context);
};

WrappedTypedArray.prototype.filter = function(predicate, context) {
  return this.__operation(operation_names.FILTER, predicate, context);
};

WrappedTypedArray.prototype.reduce = function(reducer, seed, identityReducer, identity, context) {
  if (!utils.isFunction(identityReducer)) {
    context = identity;
    identity = identityReducer;
    identityReducer = reducer;
  }
  return this.__operation(operation_names.REDUCE, reducer, context, seed, identity, identityReducer);
};

WrappedTypedArray.prototype.__operation = function(name, code, localContext, seed, identity, identityCode) {
  var operation = operation_packager(name, code, seed, identity, identityCode);
  var chainContext = contextUtils.extendChainContext(0, localContext);
  var options = {
    source: this.source,
    parts: this.parts,
    operation: operation,
    globalContext: this.globalContext,
    chainContext: chainContext
  };
  return new Chain(options);
};

module.exports = WrappedTypedArray;
},{"./chain":4,"./chain_context":5,"./operation_names":10,"./operation_packager":11,"./utils":15}],"p-j-s":[function(require,module,exports){
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
  var cpus = navigator.hardwareConcurrency || options.maxWorkers || 1;
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
      if (err) { if (done) { done(err); } else { reject(err); } return; }
      mutableExtend(globalContext, updates);
      if (done) {
        done();
      } else {
        resolve();
      }
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
},{"./context_update_packager":7,"./errors":8,"./utils":15,"./workers":18,"./wrapped_typed_array":19,"xtend/mutable":3}]},{},[]);
