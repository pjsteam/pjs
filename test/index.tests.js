'use strict';

describe('initialization', function(){

  var pjs;
  var errors = require('../src/errors.js');

  beforeEach(function () {
	  pjs = require('../src/index.js');
  });

  afterEach(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

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

  if (navigator.hardwareConcurrency) {
    it('should have workers count equal to navigator.hardwareConcurrency if no options are passed.', function () {
      pjs.init();
      expect(pjs.config.workers).to.not.equal(undefined);
      expect(pjs.config.workers).to.not.equal(0);
      expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
    });
  } else {
    it('should have workers count equal to 1 if navigator.hardwareConcurrency is not defined and no options are passed.', function () {
      pjs.init();
      expect(pjs.config.workers).to.not.equal(undefined);
      expect(pjs.config.workers).to.not.equal(0);
      expect(pjs.config.workers).to.equal(1);
    });
  }

  it('should not have configuration after termination.', function () {
    pjs.init();
    expect(pjs.config.workers).to.not.equal(undefined);
    pjs.terminate();
    expect(pjs.config).to.equal(undefined);
  });

  it('should have configuration after init-terminate-init cycle.', function () {
    pjs.init();
    expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency||1);
    pjs.terminate();
    expect(pjs.config).to.equal(undefined);
    pjs.init();
    expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency||1);
  });

  it('should clear globalContext when terminating', function(done){
    this.timeout(4000);
    pjs.init();
    pjs.updateContext({
      value: 10
    }, function(err){
      if (err) { return done(err); }
      pjs(new Uint32Array([1,2,3,4,5])).reduce(function(e, v, ctx){
        return ctx.value;
      }, 0, 0).seq(function(err, result){
        if (err) { return done(err); }

        expect(result).to.equal(10);

        pjs.terminate();
        pjs.init();

        pjs(new Uint32Array([1,2,3,4,5])).reduce(function(e, v, ctx){
          return ctx.value;
        }, 0, 0).seq(function(err, result){
          if (err) { return done(err); }
          expect(result).to.be.undefined;
          done();
        });
      });
    });
  });

  if (navigator.hardwareConcurrency) {
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
  }

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

describe('wrap tests', function(){

  var pjs;
  var errors = require('../src/errors.js');
  var utils = require('../src/utils.js');
  var parts = 4;

  beforeEach(function () {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers: parts});
  });

  afterEach(function(){
    if (pjs.config){
      pjs.terminate();
    }
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

  [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(TypedArray)), function(){
        var sourceArray = new TypedArray([1,2,3,4,5]);

        it('should not throw if object to wrap is typed array', function () {
          expect(function () {
            pjs(sourceArray);
          }).to.not.throw(errors.InvalidArgumentsError);
        });

        it('should have source after wrap a typed array', function () {
          var wrapped = pjs(sourceArray);
          expect(wrapped.source).to.not.be.undefined;
          expect(wrapped.source).to.equal(sourceArray);
        });

        it('should have parts after wrap a typed array', function () {
          var wrapped = pjs(sourceArray);
          expect(wrapped.parts).to.not.be.undefined;
          expect(wrapped.parts).to.equal(parts);
        });
      });
    });
});