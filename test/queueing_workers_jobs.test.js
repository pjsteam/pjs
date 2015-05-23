'use strict';

describe('queueing workers jobs', function(){

  var pjs;
  var utils = require('../src/utils.js');
  var supportedArrays = require('./supported_array_types_helper')();

  before(function () {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});
  });

  after(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  supportedArrays.forEach(function (TypedArray) {
      describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(TypedArray)), function(){
        var sourceArrayA = new TypedArray([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
        var sourceArrayB = new TypedArray([20,21,22,23,24,25,26,27,28,29,30,31]);

        it('should respect chains order', function () {
          var mapperA = function(e) { return e * 2; };
          var mapperB = function(e) { return e * 4; };
          var chainA = pjs(sourceArrayA).map(mapperA);
          var chainB = pjs(sourceArrayB).map(mapperB);

          var promiseA = chainA.seq();
          var promiseB = chainB.seq();

          return Promise.race([promiseA, promiseB]).then(function (result) {
            expect(result).to.have.length(sourceArrayA.length);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArrayA));
            for (var i = sourceArrayA.length - 1; i >= 0; i--) {
              expect(result[i]).to.equal(mapperA(sourceArrayA[i]));
            }
            return promiseB.then(function (result) {
              expect(result).to.have.length(sourceArrayB.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArrayB));
              for (var i = sourceArrayB.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(mapperB(sourceArrayB[i]));
              }
            });
          });
        });

        it('should not stop calculation with on invalid seq', function () {
          var mapperA = function(e, ctx) { return ctx.aux() + e * 2; };
          var mapperB = function(e) { return e * 4; };
          var chainA = pjs(sourceArrayA).map(mapperA);
          var chainB = pjs(sourceArrayB).map(mapperB);

          var promiseA = chainA.seq();
          var promiseB = chainB.seq();

          return Promise.race([promiseA, promiseB]).catch(function (err) {
            expect(err.name).to.equal('WorkerError');
            expect(err.message).to.match(/(Uncaught TypeError: undefined is not a function)|(TypeError: ctx.aux is not a function)/);
            return promiseB.then(function (result) {
              expect(result).to.have.length(sourceArrayB.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArrayB));
              for (var i = sourceArrayB.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(mapperB(sourceArrayB[i]));
              }
            });
          });
        });
      });
    });
});