'use strict';

describe('reduce tests', function(){

  var pjs;
  var utils = require('../src/utils.js');

  beforeEach(function () {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});
  });

  afterEach(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(TypedArray)), function(){

        var reducer = function (p, e) { return p + e; };
        var identitiy = 0;

        it('should return reduced element in callback', function(done) {
          var seed = 0;
          var normalArray = [1,2,3,4,5];
          var sourceArray = new TypedArray(normalArray);
          var reducedSource = normalArray.reduce(reducer, seed);

          pjs(sourceArray).reduce(reducer, seed, identitiy).seq(function(result) {
            expect(result).to.equal(reducedSource);
            done();
          });
        });

        it('should return initial value for empty array in callback', function(done){
          var seed = 5;
          var normalArray = [];
          var sourceArray = new TypedArray(normalArray);
          pjs(sourceArray).reduce(reducer, seed, identitiy).seq(function(result){
            expect(result).to.equal(seed);
            done();
          });
        });

        it('should return reduced element for single element array in callback', function(done){
          var seed = 9;
          var normalArray = [4];
          var sourceArray = new TypedArray(normalArray);
          var reducedSource = normalArray.reduce(reducer, seed);
          pjs(sourceArray).reduce(reducer, seed, identitiy).seq(function(result){
            expect(result).to.equal(reducedSource);
            done();
          });
        });
      });
    });
});