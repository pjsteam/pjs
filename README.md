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

pjs.init({ maxWorkers: 4 }); // initialize the library

pjs(new Uint32Array([1,2,3,4]))
.filter(function(e){
  return e % 2 === 0;
}).map(function(e){
  return e * 2;
}).seq().then(function (result){
    // result is [4,8] a new Uint32Array

    // if we are not using the library any more cleanup once we are done
    pjs.terminate();
});
```

## Operations

### `map(mapper)`
The `map` operation invokes the `mapper` function for each element of the wrapped `TypedArray`. It produces a new array of the same type where each element is the result of the `mapper` function.

### `filter(predicate)`
The `filter` operation invokes the `predicate` function for each element of the wrapped `TypedArray`. It produces a new array of the same type which only includes the original elements for which the `predicate` function returns `true` (or a _truthy_ value).

### `reduce(reducer, seed[, identityReducer], identity)`
The `reduce` operation invokes the `reducer` function for each element of the wrapped `TypedArray` passing the value of the previous invocation as the first parameter (`current`) and the element as the second one.

The reduction is first performed in the Web Workers using `identity` as the intial value for `current`. The results from the Web Workers are collected and a new reduction is performed on them using `seed` and `identityReducer` function.

## Documentation
You can find out more by checking out the [complete API](https://github.com/pjsteam/pjs/wiki/API) and the How Tos in our [wiki](https://github.com/pjsteam/pjs/wiki).

## Acknowledgements
* Using [this great seed](https://github.com/mgonto/gulp-browserify-library-seed) project from [@mgonto](https://twitter.com/mgonto).
* [@mraleph](https://twitter.com/mraleph) for [IR Hydra](https://github.com/mraleph/irhydra) and the help he provided to use it.
