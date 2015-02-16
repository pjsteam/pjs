# p-j-s ![build status](https://travis-ci.org/pjsteam/pjs.svg)

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

pjs(new Uint32Array([1,2,3,4])).map(function(e){
    return e * 2;
}, function(result){
    // use result...
    
    // if we are not using the library any more cleanup once we are done
    pjs.terminate();
});
```

## API

### pjs(typedArray)
Returns a `WrappedTypedArray` for the `typedArray` parameter.

__Arguments__

* `typedArray` - The `TypedArray` to wrap.

__Example__
```js
var pjs = require('p-j-s');
var array = new Uint32Array([1,2,3,4]);
var wrappedArray = pjs(array);
```

### pjs.init([options])
Initializes the library using the provided `options`.

__Arguments__

* `options` - optional configuration.
  * `maxWorkers` - Maximum amount of Web Workers that the library can use. Defaults to the amount of cores in the machine.

__Example__
```js
var array = new Uint32Array([1,2,3,4]);
var wrappedArray = pjs(array);
```

### pjs.terminate()
Terminates all workers and resets the library configuration.

__Example__
```js
pjs.terminate();
```

### WrappedTypedArray.prototype.map(mapper, done)
Invokes the `mapper` function on each element of the wrapped `TypedArray`. Returns a new array of the same type where each element is the result of the `mapper` function.

__Arguments__

* `mapper(element)` - the function to invoke for each element. Must return the mapped element.
* `done(result)` - the function invoked when the asynchronous computation is completed. Receives `result` which is the new `TypedArray` with the resulting elements.

__Example__
```js
pjs(new Uint32Array([1,2,3,4])).map(function(e){
    return e * 2;
}, function(result){
    // result is a Uint32Array with values [2,4,6,8]
});
```

## Acknowledgements
* Using [this great seed](https://github.com/mgonto/gulp-browserify-library-seed) project from [@mgonto](https://twitter.com/mgonto).
* [@mraleph](https://twitter.com/mraleph) for [IR Hydra](https://github.com/mraleph/irhydra) and the help he provided to use it.