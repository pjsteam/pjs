'use strict';

describe('promises tests', function () {
  var pjs;
  var errors = require('../src/errors');

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
      expect(promise.constructor).to.equals(Promise);
    });

    it('should resolve promise', function (done) {
      var promise = pjs.updateContext({
        add: function (x) { return x + 2; },
        max: 5
      });
      promise.then(done, function (err) {
        done(err);
      });
    });
  });

  describe('seq tests', function () {
    var normalSourceArray = [1,2,3,4,5];
    var TypedArray = Uint32Array;

    it('should return a promise when map chain is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var promise = pjs(sourceArray).map(function (e) { return e * 0.1; }).seq();
      expect(promise).to.not.be.undefined;
      expect(promise.constructor).to.equals(Promise);
    });

    it('should return a promise on filter chain is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var promise = pjs(sourceArray).filter(function (e) { return e * 0.1 < 10; }).seq();
      expect(promise).to.not.be.undefined;
      expect(promise.constructor).to.equals(Promise);
    });

    it('should return a promise on reduce chain is evaluated', function () {
      var sourceArray = new TypedArray(normalSourceArray);
      var promise = pjs(sourceArray).reduce(function (p, e) { return p + e; }, 0, 0).seq();
      expect(promise).to.not.be.undefined;
      expect(promise.constructor).to.equals(Promise);
    });

    it('should map when promise is evaluated', function (done) {
      var sourceArray = new TypedArray(normalSourceArray);
      var mapper = function (e) { return e * 0.1; };
      var promise = pjs(sourceArray).map(mapper).seq();
      promise.then(function (result) {
        var normalResult = normalSourceArray.map(mapper);
        for (var i = 0; i < result.length; i++) {
          expect(result[i]).to.equals(normalResult[i])
        }
        done();
      }, function (err) {
        done(err);
      });
    });

    it('should filter when promise is evaluated', function (done) {
      var sourceArray = new TypedArray(normalSourceArray);
      var predicate = function (e) { return e / 2 < 1.5; };
      var promise = pjs(sourceArray).filter(predicate).seq();
      promise.then(function (result) {
        var normalResult = normalSourceArray.filter(predicate);
        for (var i = 0; i < result.length; i++) {
          expect(result[i]).to.equals(normalResult[i])
        }
        done();
      }, function (err) {
        done(err);
      });
    });

    it('should reduce when promise is evaluated', function (done) {
      var sourceArray = new TypedArray(normalSourceArray);
      var reducer = function (p, e) { return p + e; };
      var promise = pjs(sourceArray).reduce(reducer, 0, 0).seq();
      promise.then(function (result) {
        var normalResult = normalSourceArray.reduce(reducer, 0);
        for (var i = 0; i < result.length; i++) {
          expect(result[i]).to.equals(normalResult[i])
        }
        done();
      }, function (err) {
        done(err);
      });
    });
  });
});
