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
      var sourceArray = new TypedArray([1,2,3,4,5]);

      it(utils.format('should return filtered elements for array of type {0} in callback', utils.getTypedArrayType(sourceArray)), function(done){
        pjs(sourceArray).filter(function(e){
          return 0 === (e % 2);
        }, function(result) {
          expect(result).to.have.length(2);
          expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
          expect(result[0]).to.equal(2);
          expect(result[1]).to.equal(4);
          done();
        });
      });

    });
});