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

## Terminate
When you are done using **p-j-s** you should terminate it so the resources it is using (such as workers) are cleaned up.

```javascript
pjs.terminate();
```

## Acknowledgements
* Using [this great seed](https://github.com/mgonto/gulp-browserify-library-seed) project from @mgonto.