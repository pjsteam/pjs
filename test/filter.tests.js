'use strict';

describe('filter tests', function(){

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

        it('should return filtered elements in callback', function(done){
          pjs(sourceArray).filter(function(e){
            return 0 === (e % 2);
          }).seq(function(err, result) {
            expect(result).to.have.length(2);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            expect(result[0]).to.equal(2);
            expect(result[1]).to.equal(4);
            done();
          });
        });

        var emptySourceArray = new TypedArray([]);
        it('should return no elements for empty array in callback', function(done){
          pjs(emptySourceArray).map(function(e){
            return true;
          }).seq(function(err, result){
            expect(result).to.have.length(0);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(emptySourceArray));
            done();
          });
        });

        it('should return no elements if no elements match predicate in callback', function(done){
          pjs(sourceArray).filter(function(e){
            return false;
          }).seq(function(err, result) {
            expect(result).to.have.length(0);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            done();
          });
        });

        it('should return all elements if all elements match predicate in callback', function(done){
          pjs(sourceArray).filter(function(e){
            return true;
          }).seq(function(err, result) {
            expect(result).to.have.length(sourceArray.length);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            for (var i = 0; i < sourceArray.length; i += 1) {
              expect(result[i]).to.equal(sourceArray[i]);
            }
            done();
          });
        });

        var singleElementSourceArray = new TypedArray([4]);
        it('should return filtered elements for single element in callback', function(done){
          pjs(singleElementSourceArray).filter(function(e){
            return true;
          }).seq(function(err, result){
            expect(result).to.have.length(singleElementSourceArray.length);
            expect(result[0]).to.equal(singleElementSourceArray[0]);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(singleElementSourceArray));
            done();
          });
        });
      });
    });
});