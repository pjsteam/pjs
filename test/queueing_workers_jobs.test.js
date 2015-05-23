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
      describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(TypedArray)), function(done){
        var sourceArrayA = new TypedArray([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
        var sourceArrayB = new TypedArray([20,21,22,23,24,25,26,27,28,29,30,31]);

        it('should respect chains order', function () {
          var mapperA = function(e) { return e * 2; };
          var mapperB = function(e) { return e * 4; };
          var chainA = pjs(sourceArrayA).map(mapperA);
          var chainB = pjs(sourceArrayB).map(mapperB);

          var chainAFinished = false;

          chainA.seq(function(err, result) {
            chainAFinished = true;
            if (err) { return done(err); }
            finisher(err, result, sourceArrayA, mapperA);
          });
          chainB.seq(function(err, result) {
            if (err) { return done(err); }
            if (!chainAFinished) { return done('Chain A should end first.'); }
            finisher(err, result, sourceArrayB, mapperB);
          });

          var finishCount = 0;
          var finisher = function (err, result, sourceArray, mapper) {
            finishCount++;
            expect(result).to.have.length(sourceArray.length);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            for (var i = sourceArray.length - 1; i >= 0; i--) {
              expect(result[i]).to.equal(mapper(sourceArray[i]));
            }
            if (finishCount === 2) {
              done();
            }
          };
        });

        it('should not stop calculation with on invalid seq', function () {
          var mapperA = function(e, ctx) { return ctx.aux() + e * 2; };
          var mapperB = function(e) { return e * 4; };
          var chainA = pjs(sourceArrayA).map(mapperA);
          var chainB = pjs(sourceArrayB).map(mapperB);

          chainA.seq(function(err, result) {
            if (err) {
              finisher(err, result, sourceArrayA, mapperA);
            } else {
              return done(err);
            }
            
          });
          chainB.seq(function(err, result) {
            if (err) { return done(err); }
            finisher(err, result, sourceArrayB, mapperB);
          });
          
          var finisher = function (err, result, sourceArray, mapper) {
            finishCount++;
            if (result) {
              expect(result).to.have.length(sourceArray.length);
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              for (var i = sourceArray.length - 1; i >= 0; i--) {
                expect(result[i]).to.equal(mapper(sourceArray[i]));
              }
            }
            if (err) {
              expect(err.name).to.equal('WorkerError');
              expect(err.message).to.match(/(Uncaught TypeError: undefined is not a function)|(TypeError: ctx.aux is not a function)/);
            }
            if (finishCount === 2) {
              done();
            }
          };
        });
      });
    });
});