'use strict';

describe('map tests', function(){

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
        var sourceArray = new TypedArray([1,2,3,4,5]);
        it('should return mapped elements in callback', function(done){
          pjs(sourceArray).map(function(e){
            return e * 2;
          }).seq(function(result){
            expect(result).to.have.length(sourceArray.length);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            for (var i = sourceArray.length - 1; i >= 0; i--) {
              expect(result[i]).to.equal(sourceArray[i] * 2);
            };
            done();
          });
        });

        var emptySourceArray = new TypedArray([]);
        it('should return no elements for empty array in callback', function(done){
          pjs(emptySourceArray).map(function(e){
            return e * 2;
          }).seq(function(result){
            expect(result).to.have.length(0);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(emptySourceArray));
            done();
          });
        });

        var singleElementSourceArray = new TypedArray([4]);
        it('should return mapped elements for single element array in callback', function(done){
          pjs(singleElementSourceArray).map(function(e){
            return e * 2;
          }).seq(function(result){
            expect(result).to.have.length(singleElementSourceArray.length);
            expect(result[0]).to.equal(singleElementSourceArray[0] * 2);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(singleElementSourceArray));
            done();
          });
        });
      });
    });
});