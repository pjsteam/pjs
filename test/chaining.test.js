'use strict';

describe('chaining tests', function(){

  var pjs;
  var utils = require('../src/utils.js');
  var Skeleton = require('../src/skeleton');

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
        var normalSourceArray = [1,2,3,4,5];
        var sourceArray = new TypedArray(normalSourceArray);

        describe('map skeleton', function () {
          it ('map should return Skeleton', function () {
            var wrapped = pjs(sourceArray);
            var skeleton = wrapped.map(function (e) { return e; });
            expect(skeleton.constructor).to.be.equal(Skeleton);
          });

          it ('sequenced map should return mapped array in callback', function (done) {
            var wrapped = pjs(sourceArray);
            wrapped.map(function (e) { return e * 2; }).seq(function (result) {
              expect(result).to.have.length(sourceArray.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              for (var i = sourceArray.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(sourceArray[i] * 2);
              };
              done();
            });
          });

          it ('sequenced map-map should return mapped array in callback', function (done) {
            var wrapped = pjs(sourceArray);
            var mapper1 = function (e) { return e * 2; };
            var mapper2 = function (e) { return e * 3; };
            wrapped.map(mapper1).map(mapper2).seq(function (result) {
              expect(result).to.have.length(sourceArray.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              var normalChaining = normalSourceArray.map(mapper1).map(mapper2);
              for (var i = sourceArray.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(normalChaining[i]);
              };
              done();
            });
          });

          it ('sequenced map-filter should return mapped-and-filtered array in callback', function (done) {
            var wrapped = pjs(sourceArray);
            var mapper = function (e) { return e * 3; };
            var predicate = function (e) { return 1 == (e % 2); };
            wrapped.map(mapper).filter(predicate).seq(function (result) {
              var normalChaining = normalSourceArray.map(mapper).filter(predicate);
              expect(result).to.have.length(normalChaining.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              for (var i = sourceArray.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(normalChaining[i]);
              };
              done();
            });
          });
        });

        describe('filter skeleton', function () {
          it ('filter should return Skeleton', function () {
            var wrapped = pjs(sourceArray);
            var skeleton = wrapped.filter(function (e) {return true; } );
            expect(skeleton.constructor).to.be.equal(Skeleton);
          });

          it ('sequenced filter should return filtered array in callback', function (done) {
            var wrapped = pjs(sourceArray);
            var predicate = function (e) {
              return 1 == (e % 2);
            };
            wrapped.filter(predicate).seq(function (result) {
              var normalResult = normalSourceArray.filter(predicate);
              expect(result).to.have.length(normalResult.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              for (var i = normalResult.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(normalResult[i]);
              };
              done();
            });
          });

          it ('sequenced filter-filter should return filtered array in callback', function (done) {
            var wrapped = pjs(sourceArray);
            var predicate1 = function (e) { return 0 == e % 2; };
            var predicate2 = function (e) { return 0 == e % 4; };
            wrapped.filter(predicate1).filter(predicate2).seq(function (result) {
              var normalChaining = normalSourceArray.filter(predicate1).filter(predicate2);
              expect(result).to.have.length(normalChaining.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              for (var i = sourceArray.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(normalChaining[i]);
              };
              done();
            });
          });

          it ('sequenced filter-map should return filtered-and-mapped array in callback', function (done) {
            var wrapped = pjs(sourceArray);
            var mapper = function (e) { return e * 3; };
            var predicate = function (e) { return 1 == (e % 2); };
            wrapped.filter(predicate).map(mapper).seq(function (result) {
              var normalChaining = normalSourceArray.filter(predicate).map(mapper);
              expect(0 < result.length).to.be.true;
              expect(result).to.have.length(normalChaining.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              for (var i = sourceArray.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(normalChaining[i]);
              };
              done();
            });
          });
        });

        describe('reduce skeleton', function () {
          it ('reduce should return Skeleton', function () {
            var wrapped = pjs(sourceArray);
            var skeleton = wrapped.reduce(function (p, e) { return p + e; }, 0, 0);
            expect(skeleton.constructor).to.be.equal(Skeleton);
          });

          it('sequenced reduce should return reduced element in callback', function(done) {
            var seed = 0;
            var identitiy = 0;
            var reducer = function (p, e) {
              return p + e;
            };
            var reducedSource = normalSourceArray.reduce(reducer, seed);
            var wrapped = pjs(sourceArray);
            wrapped.reduce(reducer, seed, identitiy).seq(function (result) {
              expect(result).to.equal(reducedSource);
              done();
            });
          });
        });
      });
    });
});