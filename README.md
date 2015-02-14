p-j-s
=====
A library to parallelize `map`, `filter` and `reduce` operations on typed arrays through the use of Web Workers.

# Installing
```
npm i p-j-s
```

# Usage

## Initialization
The first thing you need to do before using the library is to initialize it.

It's as simple as:
```javascript
var pjs = require('p-j-s');

pjs.init();
```

The above code automatically detects the amount of cores available in your machine, which provides an upper bound on the amount of workers to be created.

If you want to further restrict the amount of workers to be created you can use:
```javascript
pjs.init({
  maxWorkers: 2
});
```

After calling `init`, a pool of workers will be available for use by the library.

## Termination
When you are done using **p-j-s** you should terminate it so the resources it is using (such as workers) are cleaned up.

```javascript
pjs.terminate();
```

## map
If you want to apply a transformation to all the elements in an array you can use the `map` function.

The map function has the following signature: `function map(mapper, done)`:

* `mapper`: A function to be invoked for each element of the source array and must return an element in the target array. It takes one argument: `element`.
* `done`: A function to be invoked when the asynchronous map operation has completed. It takes one parameter: `result`.

### Example
```javascript
var array = new Uint32Array([1,2,3,4,5]);
pjs(array).map(function(e){
  return e * 2;
}, function(result){
  console.log(result); // [2,4,6,8,10]
});
```

## Acknowledgements
* Using [this great seed](https://github.com/mgonto/gulp-browserify-library-seed) project from @mgonto.