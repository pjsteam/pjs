# p-j-s ![build status](https://travis-ci.org/pjsteam/pjs.svg?branch=dev)

A library to parallelize `map`, `filter` and `reduce` operations on typed arrays through the use of Web Workers.

## Installing
```
npm i p-j-s
```

## Usage
It's as simple as:
```js
var pjs = require('p-j-s');

pjs.init(); // initialize the library

pjs(new Uint32Array([1,2,3,4]))
.filter(function(e){
  return e % 2 === 0;
}).map(function(e){
  return e * 2;
}).seq(function(err, result){
    // result is [4,8] a new Uint32Array

    // if we are not using the library any more cleanup once we are done
    pjs.terminate();
});
```

## Operations

### `map`
The `map` operation invokes the `mapper` function on each element of the wrapped `TypedArray`. It produces a new array of the same type where each element is the result of the `mapper` function.

### `filter`
The `filter` operation invokes the `predicate` function on each element of the wrapped `TypedArray`. It produces a new array of the same type which only includes the original elements for which the `predicate` function returns `true` (or a _truthy_ value).

### `reduce`
The `reduce` operation invokes the `reducer` function on each element of the wrapped `TypedArray` passing the value of the previous invocation as `current`.

The reduction is first performed in the Web Workers using `identity` as the intial value for `current`. The results from the Web Workers are collected and a new reduction is performed on them using `seed` and `identityReducer` function.

## API

### `pjs(typedArray)`
Returns a [`WrappedTypedArray`](#wrapped_typed_array) for the `typedArray` parameter.

__Parameters__

* `typedArray` - The `TypedArray` to wrap.

__Example__
```js
var pjs = require('p-j-s');
var array = new Uint32Array([1,2,3,4]);
var wrappedArray = pjs(array);
```

### `pjs.init([options])`
Initializes the library using the provided `options`.

__Parameters__

* `options` - optional configuration.
  * `maxWorkers` - Maximum amount of Web Workers that the library can use. Defaults to the amount of cores in the machine.

__Example__
```js
var array = new Uint32Array([1,2,3,4]);
var wrappedArray = pjs(array);
```

### `pjs.terminate()`
Terminates all workers and resets the library configuration.

__Example__
```js
pjs.terminate();
```

<a name="wrapped_typed_array"></a>
### `WrappedTypedArray.prototype.map(mapper[, context])`
Creates a new [`Chain`](#chain) whose first operation is a `map` with the specified `mapper` and returns it.

__Parameters__

* `mapper(element[, context])` - the function to invoke for each element. Must return the mapped element.

* `context` - optional. Value used as `mapper`'s `context` parameter which is previously merged with pjs' global context.

__Returns__

Returns a [`Chain`](#chain) whose first operation is a `map` with the specified `mapper`.

__Example__
```js
pjs(new Uint32Array([1,2,3,4])).map(function(e){
    return e * 2;
}).seq(function(err, result){
    // result is a Uint32Array with values [2,4,6,8]
});
```

```js
pjs(new Uint32Array([1,2,3,4])).map(function(e, ctx){
    return ctx.minimizer(ctx.factor * e);
}, {
  factor: 2,
  minimizer: function (e) {
    return Math.min(e, 5);
  }
}).seq(function(err, result){
    // result is a Uint32Array with values [2,4,5,5]
});
```

### `WrappedTypedArray.prototype.filter(predicate[, context])`
Creates a new [`Chain`](#chain) whose first operation is a `filter` with the specified predicate and returns it.

__Parameters__

* `predicate(element[, context])` - the function to invoke for each element. Must return `true` (or a [_truthy_ value](http://www.sitepoint.com/javascript-truthy-falsy/)) if the element is to be included in the resulting `TypedArray`, otherwise `false` (or a not _truthy_ value).

* `context` - optional. Value used as `predicate`'s `context` parameter which is previously merged with pjs' global context.

__Returns__

Returns a [`Chain`](#chain) whose first operation is a `filter` with the specified `predicate`.

__Example__
```js
pjs(new Uint32Array([1,2,3,4])).filter(function(e){
    return e % 2 === 0;
}).seq(function(err, result){
    // result is a Uint32Array with values [2,4]
});
```

```js
pjs(new Uint32Array([1,2,3,4])).filter(function(e, ctx){
    return e % ctx.module === 0;
}, {
  module: 2
}).seq(function(err, result){
    // result is a Uint32Array with values [2,4]
});
```

### `WrappedTypedArray.prototype.reduce(reducer, seed[, identityReducer], identity[, context])`
Creates a new [`Chain`](#chain) whose first (and last) operation is a `reduce` with the specified `seed`, `identity` and `identityReducer` function and returns it.

__Parameters__

* `reducer(current, element[, context])` - the function to invoke for each element. Must return the resulting value.
  * `current` - the value of returned by `reducer` for the previous `element`. First time is initialized with `identity`.
  * `element` - the current `TypedArray` element.
  * `context` - optional. The union context from pjs' global context and chain's local context.
* `seed` - the initial value for current when the `reducer` when executing the reduction on the Web Worker results.
* `identityReducer(current, element[, context])` - the function to invoke for each web worker result.
  * `current` - the value of returned by `identityReducer` for the previous `element`. First time is initialized with `seed`.
  * `element` - the current `TypedArray` element.
  * `context` - optional. The union context from pjs' global context and chain's local context.
* `identity` - the initial value for `current` when executing the reduction in the Web Workers.
* `context` - optional. Value used as `reducer`'s `context` parameter which is previously merged with pjs' global context.

__Returns__

Returns a [`Chain`](#chain) whose first (and last) operation is a `reduce` with the specified `seed`, `identity` and `identityReducer` function.

__Example__
```js
pjs(new Uint32Array([1,2,3,4])).reduce(function(current, element){
    return current * element;
}, 5, 1).seq(function(err, result){
    // result is 5! => 120
});
```

```js
pjs(new Uint32Array([1,2,3,4])).reduce(function(current, element){
    return current + element + 2;
}, 3, function (current, element) {
  return current + element;
}, 0).seq(function(err, result){
    // result is 21
});
```

```js
pjs(new Uint32Array([1,2,3,4])).reduce(function(current, element, context){
    return current + context.adder(element);
}, 3, function (current, element) {
  return current + element;
}, 0, {
  adder: function (element) {
    return element + 2;
  }
}).seq(function(err, result){
    // result is 21
});
```

<a name="chain"></a>
### `Chain.prototype.map(mapper[, context])`
Adds a `map` operation with the provided `mapper` to the `Chain`. Returns a new `Chain` instance.

__Precondition__

* `reduce` has not been invoked on the `Chain`.

__Parameters__

* `mapper(element[, context])` - the function to invoke for each element. Must return the mapped element.
* `context` - optional. Value used as `mapper`'s `context` parameter which is previously merged with pjs' global context.

__Returns__

Returns a new `Chain` instance.

__Example__
```js
var chain = pjs(new Uint32Array([1,2,3,4])).filter(function(e){
    return e % 2 === 0;
});

chain.map(function(e){
    return e * 3;
}).seq(function(err, result){
    // result is a Uint32Array with values [6,12]
});
```

### `Chain.prototype.filter(predicate[, context])`
Adds a `filter` operation with the provided `predicate` to the `Chain`. Returns a new `Chain` instance.

__Precondition__

* `reduce` has not been invoked on the `Chain`.

__Parameters__

* `predicate(element[, context])` - the function to invoke for each element. Must return `true` (or a [_truthy_ value](http://www.sitepoint.com/javascript-truthy-falsy/)) if the element is to be included in the resulting `TypedArray`, otherwise `false` (or a not _truthy_ value).
* `context` - optional. Value used as `predicate`'s `context` parameter which is previously merged with pjs' global context.

__Returns__

Returns a new `Chain` instance.

__Example__
```js
var chain = pjs(new Uint32Array([1,2,3,4])).map(function(e){
    return e * 2;
});

chain.filter(function(e){
    return e < 4;
}).seq(function(err, result){
    // result is a Uint32Array with values [2]
});
```

### `Chain.prototype.reduce(reducer, seed[, identityReducer], identity[, context])`
Adds a `reduce` with the specified `seed` and `identity` to the `Chain`. Returns a new `Chain` instance.

__Parameters__

* `reducer(current, element[, context])` - the function to invoke for each element. Must return the resulting value.
  * `current` - the value of returned by `reducer` for the previous `element`. First time is initialized with `identity`.
  * `element` - the current `TypedArray` element.
  * `context` - optional. The union context from pjs' global context and chain's local context.
* `seed` - the initial value for current when the `reducer` when executing the reduction on the Web Worker results.
* `identityReducer(current, element[, context])` - the function to invoke for each web worker result.
  * `current` - the value of returned by `identityReducer` for the previous `element`. First time is initialized with `seed`.
  * `element` - the current `TypedArray` element.
  * `context` - optional. The union context from pjs' global context and chain's local context.
* `identity` - the initial value for `current` when executing the reduction in the Web Workers.
* `context` - optional. Value used as `reducer`'s and `identityReducer`'s `context` parameter which is previously merged with pjs' global context.

__Returns__

Returns a new `Chain` instance.

__Example__
```js
var chain = pjs(new Uint32Array([1,2,4])).map(function(e){
  return e * 2;
});

chain.reduce(function(current, element){
    return current + element;
}, 1, 0).seq(function(err, result){
    // result is 15
});
```

### `Chain.prototype.seq(err, done)`
Executes all operations in the `Chain` asynchronously. When the result is available or an error occurs `done` is invoked.

* `done(err, result)` - the function invoked passing the `result` of the asynchronous computation when it is completed.
  * `err` - If an error ocurred, it contains the error message.
  * `result` - The result of the chain's asynchronous computation.

__Parameters__
```js
var chain = pjs(new Uint32Array([1,2,3,4])).map(function(e){
  return e * 2;
});

chain.filter(function(e){
  return e < 8;
}).reduce(function(c, e){
  return c + e
}, 0, 0).seq(function(err, result){
  // result is 12
});
```

## Acknowledgements
* Using [this great seed](https://github.com/mgonto/gulp-browserify-library-seed) project from [@mgonto](https://twitter.com/mgonto).
* [@mraleph](https://twitter.com/mraleph) for [IR Hydra](https://github.com/mraleph/irhydra) and the help he provided to use it.
