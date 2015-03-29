'use strict';

describe('additional context tests', function(){

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
        
        var normalSourceArray = [1,2,3,5,13,16,32,63,64,129,255,500,1001,1023,1024];
        var sourceArray = new TypedArray(normalSourceArray);

        it('should return mapped elements in callback using context', function(done){
          var mapper = function (e, ctx) {
            return e & ctx.filter;
          };
          var ctx = {
            filter: 0x0000000F
          };
          pjs(sourceArray).map(mapper, ctx).seq(function(result){
            expect(result).to.have.length(sourceArray.length);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            for (var i = sourceArray.length - 1; i >= 0; i--) {
              expect(result[i]).to.equal(sourceArray[i] & ctx.filter);
            };
            done();
          });
        });

        it('should return filter elements in callback using context', function(done){
          var predicate = function (e, ctx) {
            return ctx.min < e && e < ctx.max; 
          }
          var ctx = {
            min: 0x0000000a,
            max: 0x00000100
          };
          pjs(sourceArray).filter(predicate, ctx).seq(function(result){
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            var index = 0;
            var i = 0;
            for ( ; index < result.length; index++) {
              var sourceElement = sourceArray[index];
              if (predicate(sourceElement, ctx)) {
                expect(result[i]).to.equal(sourceElement);
                i++;
              }
            }
            expect(index).to.equal(result.length);
            done();
          });
        });

        it('should return reduced element in callback usign context', function(done) {
          var seed = 0;
          var identitiy = 0;
          var reducer = function (p, e, ctx) {
            return Math.min(Math.max(p, e), ctx.max);
          };
          var ctx = {
            max: 0x00000070
          };
          var reducedSource = Array.prototype.slice.call(sourceArray).reduce(function (p, e) {
            return reducer(p, e, ctx);
          }, seed);
          var wr = pjs(sourceArray).reduce(reducer, seed, identitiy, ctx);
          wr.seq(function (result) {
            expect(result).to.equal(reducedSource);
            done();
          });
        });
      });
    });
});