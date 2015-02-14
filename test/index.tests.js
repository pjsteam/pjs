'use strict';

describe('initialization', function(){

  var pjs;
  var errors = require('../src/errors.js');
  var utils = require('../src/utils.js');

  beforeEach(function () {
	  pjs = require('../src/index.js');
  });

  afterEach(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  describe('lifecycle tests', function(){
    it('should not have configuration before pjs initialization.', function () {
      expect(pjs.config).to.equal(undefined);
    });

    it('should have configuration after pjs initialization.', function () {
      pjs.init();
      expect(pjs.config).to.not.equal(undefined);
    });

    it('should throw exception after consecutive initialization without termination', function () {
      pjs.init();
      expect(pjs.init).to.throw(errors.InvalidOperationError);
    });

    it('should throw exception if terminate is called without previous initialization.', function () {
      expect(pjs.terminate).to.throw(errors.InvalidOperationError);
    });

    it('should have workers count equal to navigator.hardwareConcurrency if no options are passed.', function () {
      pjs.init();
      expect(pjs.config.workers).to.not.equal(undefined);
      expect(pjs.config.workers).to.not.equal(0);
      expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
    });

    it('should not have configuration after termination.', function () {
      pjs.init();
      expect(pjs.config.workers).to.not.equal(undefined);
      pjs.terminate();
      expect(pjs.config).to.equal(undefined);
    });

    it('should have configuration after init-terminate-init cycle.', function () {
      pjs.init();
      expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
      pjs.terminate();
      expect(pjs.config).to.equal(undefined);
      pjs.init();
      expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
    });

    it('should have workers count equal to navigator.hardwareConcurrency - 1 if that value is passed as maxWorkers option.', function () {
      var max = navigator.hardwareConcurrency - 1;
      pjs.init({
        maxWorkers: max
      });
      expect(pjs.config.workers).to.not.equal(undefined);
      expect(pjs.config.workers).to.not.equal(0);
      expect(pjs.config.workers).to.equal(max);
    });

    it('should have workers count equal to navigator.hardwareConcurrency if navigator.hardwareConcurrency + 3 is passed as maxWorkers option.', function () {
      pjs.init({
        maxWorkers: navigator.hardwareConcurrency + 3
      });
      expect(pjs.config.workers).to.not.equal(undefined);
      expect(pjs.config.workers).to.not.equal(0);
      expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
    });

    it('should not be possible to override config property', function () {
      pjs.init();
      expect(function () {
        pjs.config = {};
      }).to.throw();
    });

    it('should not be possible to override config.workers property', function () {
      pjs.init();
      expect(function () {
        pjs.config.workers = 0;
      }).to.throw();
    });
  });

  describe ('wrap tests', function(){
    beforeEach(function () {
      pjs.init({maxWorkers:4});
    });

    it('should require at least one parameter to wrap', function () {
      expect(function () {
        pjs();
      }).to.throw(errors.InvalidArgumentsError);
    });

    it('should throw if object to wrap is not typed array', function () {
      expect(function () {
        pjs([1,6,8,9,14]);
      }).to.throw(errors.InvalidArgumentsError);
    });
  });

  describe ('map tests', function(){
    beforeEach(function () {
      pjs.init({maxWorkers:4});
    });


  [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      var sourceArray = new TypedArray([1,2,3,4,5]);
      it(utils.format('should return mapped elements for array of type {0} in callback', utils.getTypedArrayType(sourceArray)), function(done){
        pjs(sourceArray).map(function(e){
          return e * 2;
        }, function(result){
          expect(result).to.have.length(sourceArray.length);
          expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
          for (var i = sourceArray.length - 1; i >= 0; i--) {
            expect(result[i]).to.equal(sourceArray[i] * 2);
          };
          done();
        });
      });

      var emptySourceArray = new TypedArray([]);
      it(utils.format('should return no elements for empty array of type {0} in callback', utils.getTypedArrayType(emptySourceArray)), function(done){
        pjs(emptySourceArray).map(function(e){
          return e * 2;
        }, function(result){
          expect(result).to.have.length(0);
          expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(emptySourceArray));
          done();
        });
      });

      var singleElementSourceArray = new TypedArray([4]);
      it(utils.format('should return mapped elements for single element array of type {0} in callback', utils.getTypedArrayType(singleElementSourceArray)), function(done){
        pjs(singleElementSourceArray).map(function(e){
          return e * 2;
        }, function(result){
          expect(result).to.have.length(singleElementSourceArray.length);
          expect(result[0]).to.equal(singleElementSourceArray[0] * 2);
          expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(singleElementSourceArray));
          done();
        });
      });
    });
  });
});