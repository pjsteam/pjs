'use strict';

describe('promises tests', function () {
  var pjs;
  var errors = require('../src/errors');
  var chromeHelper = require('./chrome_version_helper');

  before(function () {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});
  });

  after(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  describe('global context tests', function () {
    it('should return a promise with update context method', function () {
      var promise = pjs.updateContext({
        add: function (x) { return x + 2; },
        max: 5
      });
      expect(promise).to.not.be.undefined;
      expect(promise.constructor).to.equal(Promise);
    });

    it('should resolve promise', function () {
      return pjs.updateContext({
        add: function (x) { return x + 2; },
        max: 5
      });
    });
  });

  describe('seq tests', function () {
    var normalSourceArray = [1,2,3,4,5];
    var TypedArray = Uint32Array;

    it('should return a promise when map chain is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var promise = pjs(sourceArray).map(function (e) { return e + 3; }).seq();
      expect(promise).to.not.be.undefined;
      expect(promise.constructor).to.equal(Promise);
      return promise;
    });

    it('should return a promise on filter chain is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var promise = pjs(sourceArray).filter(function (e) { return e + 1 < 10; }).seq();
      expect(promise).to.not.be.undefined;
      expect(promise.constructor).to.equal(Promise);
      return promise;
    });

    it('should return a promise on reduce chain is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var promise = pjs(sourceArray).reduce(function (p, e) { return p + e; }, 0, 0).seq();
      expect(promise).to.not.be.undefined;
      expect(promise.constructor).to.equal(Promise);
      return promise;
    });

    it('should map when promise is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var mapper = function (e) { return e + 1; };
      return pjs(sourceArray).map(mapper).seq().then(function (result) {
        var normalResult = normalSourceArray.map(mapper);
        for (var i = 0; i < result.length; i++) {
          expect(result[i]).to.equal(normalResult[i])
        }
      });
    });

    it('should filter when promise is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var predicate = function (e) { return e & 0x1 === 0x1; };
      return pjs(sourceArray).filter(predicate).seq().then(function (result) {
        var normalResult = normalSourceArray.filter(predicate);
        for (var i = 0; i < result.length; i++) {
          expect(result[i]).to.equal(normalResult[i])
        }
      });
    });

    it('should reduce when promise is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var reducer = function (p, e) { return p + e; };
      return pjs(sourceArray).reduce(reducer, 0, 0).seq().then(function (result) {
        var normalResult = normalSourceArray.reduce(reducer, 0);
        for (var i = 0; i < result.length; i++) {
          expect(result[i]).to.equal(normalResult[i])
        }
      });
    });

    chromeHelper(39, function () {
      it('should fail promise with invalid mapper function', function () {
        var sourceArray = new TypedArray(normalSourceArray);
        var mapper = function (e, ctx) { return ctx.aux(e); };
        var promise = pjs(sourceArray).map(mapper).seq();
        
        return promise.then(function () {
          throw new Error('Should have failed');
        }).catch(function (err) {
          expect(err.name).to.equal('WorkerError');
          expect(err.message).to.match(/(Uncaught TypeError: undefined is not a function)|(TypeError: ctx.aux is not a function)/);
        });
      });

      it('should fail promise with invalid predicate function', function () {
        var sourceArray = new TypedArray(normalSourceArray);
        var predicate = function (e, ctx) { return ctx.aux(e) & 0x2 === 0x2; };
        var promise = pjs(sourceArray).filter(predicate).seq();
        
        return promise.then(function () {
          throw new Error('Should have failed');
        }).catch(function (err) {
          expect(err.name).to.equal('WorkerError');
          expect(err.message).to.match(/(Uncaught TypeError: undefined is not a function)|(TypeError: ctx.aux is not a function)/);
        });
      });

      it('should fail promise with invalid reducer function', function () {
        var sourceArray = new TypedArray(normalSourceArray);
        var reducer = function (p, e, ctx) { return p * ctx.aux(e); };
        var promise = pjs(sourceArray).reduce(reducer, 1, 1).seq();

        return promise.then(function () {
          throw new Error('Should have failed');
        }).catch(function (err) {
          expect(err.name).to.equal('WorkerError');
          expect(err.message).to.match(/(Uncaught TypeError: undefined is not a function)|(TypeError: ctx.aux is not a function)/);
        });
      });
    }, true);
  });
});
