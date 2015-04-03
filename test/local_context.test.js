'use strict';

describe('local context tests', function(){

  var pjs;
  var utils = require('../src/utils.js');
  var normalSourceArray = [1,2,3,5,13,16,32,63,64,129,255,500,1001,1023,1024];

  before(function () {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});
  });

  after(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  describe('create context tests', function(){

    [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(TypedArray)), function(){

        it('should initialize map chain item without context', function () {
          var sourceArray = new TypedArray(normalSourceArray);
          var map = pjs(sourceArray).map(function (e) { return e + 1; });
          expect(map.chainContext).to.not.be.undefined;
          expect(map.chainContext.currentIndex).to.equal(0);
          expect(map.__localContext()).to.be.undefined;
        });

        it('should initialize filter chain item without context', function () {
          var sourceArray = new TypedArray(normalSourceArray);
          var filter = pjs(sourceArray).filter(function (e) { return e % 2 === 0; });
          expect(filter.chainContext).to.not.be.undefined;
          expect(filter.chainContext.currentIndex).to.equal(0);
          expect(filter.__localContext()).to.be.undefined;
        });

        it('should initialize reduce chain item without context', function () {
          var sourceArray = new TypedArray(normalSourceArray);
          var reduce = pjs(sourceArray).reduce(function (p, e) { return p + e; }, 0, 0);
          expect(reduce.chainContext).to.not.be.undefined;
          expect(reduce.chainContext.currentIndex).to.equal(0);
          expect(reduce.__localContext()).to.be.undefined;
        });

        it('should initialize map chain item with context', function () {
          var sourceArray = new TypedArray(normalSourceArray);
          var map = pjs(sourceArray).map(function (e, ctx) { return e + ctx.opt; }, {opt: 1});
          expect(map.chainContext).to.not.be.undefined;
          expect(map.chainContext.currentIndex).to.equal(0);
          var localContext = map.__localContext();
          expect(localContext).to.not.be.undefined;
          expect(localContext.opt).to.equal(1);
        });

        it('should initialize filter chain item with context', function () {
          var sourceArray = new TypedArray(normalSourceArray);
          var filter = pjs(sourceArray).filter(function (e, ctx) { return e % ctx.opt === 0; }, {opt: 2});
          expect(filter.chainContext).to.not.be.undefined;
          expect(filter.chainContext.currentIndex).to.equal(0);
          var localContext = filter.__localContext();
          expect(localContext).to.not.be.undefined;
          expect(localContext.opt).to.equal(2);
        });

        it('should initialize reduce chain item with context', function () {
          var sourceArray = new TypedArray(normalSourceArray);
          var reduce = pjs(sourceArray).reduce(function (p, e, ctx) { return p + e + ctx.opt; }, 0, 0, { opt: 5});
          expect(reduce.chainContext).to.not.be.undefined;
          expect(reduce.chainContext.currentIndex).to.equal(0);
          var localContext = reduce.__localContext();
          expect(localContext).to.not.be.undefined;
          expect(localContext.opt).to.equal(5);
        });

        describe("chaining tests", function () {

          it('should not merge map-map contexts on chaining', function () {
            var sourceArray = new TypedArray(normalSourceArray);
            var map = pjs(sourceArray).map(function (e, ctx) { return e + ctx.opt; }, {opt: 1});
            var map_map = map.map(function (e, ctx) { return e + ctx.opt; }, {opt: 2});
            expect(map.__localContext().opt).to.equal(1);
            expect(map_map.__localContext().opt).to.equal(2);
            expect(map_map.chainContext[0].opt).to.equal(1);
          });

          it('should not merge map-filter contexts on chaining', function () {
            var sourceArray = new TypedArray(normalSourceArray);
            var map = pjs(sourceArray).map(function (e, ctx) { return e + ctx.opt; }, {opt: 1});
            var map_filter = map.filter(function (e, ctx) { return e % ctx.opt === 0; }, {opt: 2});
            expect(map.__localContext().opt).to.equal(1);
            expect(map_filter.__localContext().opt).to.equal(2);
            expect(map_filter.chainContext[0].opt).to.equal(1);
          });

          it('should not merge map-reduce contexts on chaining', function () {
            var sourceArray = new TypedArray(normalSourceArray);
            var map = pjs(sourceArray).map(function (e, ctx) { return e + ctx.opt; }, {opt: 1});
            var map_reduce = map.reduce(function (p, e, ctx) { return p + e + ctx.opt; }, 0, 0, { opt: 5});
            expect(map.__localContext().opt).to.equal(1);
            expect(map_reduce.__localContext().opt).to.equal(5);
            expect(map_reduce.chainContext[0].opt).to.equal(1);
          });

          it('should not merge filter-filter contexts on chaining', function () {
            var sourceArray = new TypedArray(normalSourceArray);
            var filter = pjs(sourceArray).filter(function (e, ctx) { return e % ctx.opt === 0; }, {opt: 2});
            var filter_filter = filter.filter(function (e, ctx) { return e % ctx.opt === 0; }, {opt: 4});
            expect(filter.__localContext().opt).to.equal(2);
            expect(filter_filter.__localContext().opt).to.equal(4);
            expect(filter_filter.chainContext[0].opt).to.equal(2);
          });

          it('should not merge filter-map contexts on chaining', function () {
            var sourceArray = new TypedArray(normalSourceArray);
            var filter = pjs(sourceArray).filter(function (e, ctx) { return e % ctx.opt === 0; }, {opt: 2});
            var filter_map = filter.map(function (e, ctx) { return e + ctx.opt; }, {opt: 1});
            expect(filter.__localContext().opt).to.equal(2);
            expect(filter_map.__localContext().opt).to.equal(1);
            expect(filter_map.chainContext[0].opt).to.equal(2);
          });

          it('should not merge filter-reduce contexts on chaining', function () {
            var sourceArray = new TypedArray(normalSourceArray);
            var filter = pjs(sourceArray).filter(function (e, ctx) { return e % ctx.opt === 0; }, {opt: 2});
            var filter_reduce = filter.reduce(function (p, e, ctx) { return p + e + ctx.opt; }, 0, 0, { opt: 5});
            expect(filter.__localContext().opt).to.equal(2);
            expect(filter_reduce.__localContext().opt).to.equal(5);
            expect(filter_reduce.chainContext[0].opt).to.equal(2);
          });
        });
      });
    });
  });

  describe('use context tests', function(){
    [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(TypedArray)), function(){

        it('should return mapped elements in callback using context', function(done){
          var sourceArray = new TypedArray(normalSourceArray);
          var mapper = function (e, ctx) {
            return e & ctx.filter;
          };
          var ctx = {
            filter: 0x0000000F
          };
          pjs(sourceArray).map(mapper, ctx).seq(function(err, result){
            expect(result).to.have.length(sourceArray.length);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            for (var i = sourceArray.length - 1; i >= 0; i--) {
              expect(result[i]).to.equal(sourceArray[i] & ctx.filter);
            }
            done();
          });
        });

        it('should return filter elements in callback using context', function(done){
          var sourceArray = new TypedArray(normalSourceArray);
          var predicate = function (e, ctx) {
            return ctx.min < e && e < ctx.max; 
          };
          var ctx = {
            min: 0x0000000a,
            max: 0x00000100
          };
          pjs(sourceArray).filter(predicate, ctx).seq(function (err, result){
            if (err) { return done(err); }
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
          var sourceArray = new TypedArray(normalSourceArray);
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
          wr.seq(function (err, result) {
            if (err) { return done(err); }
            expect(result).to.equal(reducedSource);
            done();
          });
        });

        it('should return mapped elements in callback using functions from context', function(done){
          var sourceArray = new TypedArray(normalSourceArray);
          var mapper = function (e, ctx) {
            return ctx.shifter(e & ctx.filter);
          };
          var ctx = {
            filter: 0x0000000F,
            shifter: function (e) {
              return e << 2;
            }
          };
          pjs(sourceArray).map(mapper, ctx).seq(function (err, result){
            if (err) { return done(err); }
            expect(result).to.have.length(sourceArray.length);
            expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
            for (var i = sourceArray.length - 1; i >= 0; i--) {
              expect(result[i]).to.equal(mapper(sourceArray[i], ctx));
            }
            done();
          });
        });

        it('should return filter elements in callback using functions from context', function(done){
          var sourceArray = new TypedArray(normalSourceArray);
          var predicate = function (e, ctx) {
            return ctx.biggerThanMin(e) && ctx.shorterThanMax(e); 
          };
          var ctx = {
            biggerThanMin: function (e) {
              return 0x0000000a < e;
            },
            shorterThanMax: function (e) {
              return e < 0x00000100;
            }
          };
          pjs(sourceArray).filter(predicate, ctx).seq(function (err, result){
            if (err) { return done(err); }
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

        it('should return reduced element in callback usign functions from context', function(done) {
          var sourceArray = new TypedArray(normalSourceArray);
          var seed = 0;
          var identitiy = 0;
          var reducer = function (p, e, ctx) {
            return ctx.minimizer(Math.max(p, e));
          };
          var ctx = {
            minimizer: function (e) {
              Math.min(e, 0x00000070);
            }
          };
          var reducedSource = Array.prototype.slice.call(sourceArray).reduce(function (p, e) {
            return reducer(p, e, ctx);
          }, seed);
          var wr = pjs(sourceArray).reduce(reducer, seed, identitiy, ctx);
          wr.seq(function (err, result) {
            if (err) { return done(err); }
            expect(result).to.equal(reducedSource);
            done();
          });
        });

        describe("chaining tests", function () {

          it('should use local context on each chain', function(done){
            var sourceArray = new TypedArray(normalSourceArray);
            var mapper = function (e, ctx) { return ctx.shifter(e & ctx.filter); };
            var mapCtx = {
              filter: 0x0000000F,
              shifter: function (e) { return e << 2; }
            };
            var predicate = function (e, ctx) { return ctx.redValidator(e & ctx.redMask); };
            var filterCtx = {
              redMask: 0x000000FF,
              redValidator: function (e) { return e < 0x00000010; }
            };

            pjs(sourceArray).map(mapper, mapCtx).filter(predicate, filterCtx).seq(function(err, result){
              if (err) { return done(err); }
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              var trasformedSource = Array.prototype.slice.call(sourceArray).map(function (e) {
                return mapper(e, mapCtx);
              }).filter(function (e) {
                return predicate(e, filterCtx);
              });
              for (var i = 0; i < trasformedSource.length; i++) {
                expect(result[i]).to.equal(trasformedSource[i]);
              }
              done();
            });
          });

          it('should preserve local context on each chain', function(done){
            var sourceArray = new TypedArray(normalSourceArray);
            var mapper1 = function (e, ctx) { return ctx.aux(e & ctx.mask); };
            var ctx1 = {
              mask: 0x0000000F,
              aux: function (e) { return e << 2; }
            };
            var mapper2 = function (e, ctx) { return ctx.aux(e & ctx.mask); };
            var ctx2 = {
              mask: 0x000000F0,
              aux: function (e) { return e >> 2; }
            };
            pjs(sourceArray).map(mapper1, ctx1).map(mapper2, ctx2).seq(function (err, result){
              if (err) { return done(err); }
              expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
              var trasformedSource = Array.prototype.slice.call(sourceArray).map(function (e) {
                return mapper1(e, ctx1);
              }).map(function (e) {
                return mapper2(e, ctx2);
              });
              for (var i = 0; i < trasformedSource.length; i++) {
                expect(result[i]).to.equal(trasformedSource[i]);
              }
              done();
            });
          });

          it('should not access other chain local context\'s functions', function(done){
            var sourceArray = new TypedArray(normalSourceArray);
            var mapper1 = function (e, ctx) { return ctx.aux(e & ctx.mask); };
            var ctx1 = {
              mask: 0x0000000F,
              aux: function (e) { return e << 2; }
            };
            var mapper2 = function (e, ctx) { return ctx.aux(e & ctx.mask); };
            var ctx2 = {
              mask: 0x000000F0
            };
            pjs(sourceArray).map(mapper1, ctx1).map(mapper2, ctx2).seq(function (err, result){
              expect(err).to.equal('Uncaught TypeError: undefined is not a function');
              done();
            });
          });

          it('should not access other chain local context\'s values', function(done){
            var sourceArray = new TypedArray(normalSourceArray);
            var mapper1 = function (e, ctx) { return ctx.aux(e & ctx.mask.r); };
            var ctx1 = {
              mask: {r: 0x0000000F},
              aux: function (e) { return e << 2; }
            };
            var mapper2 = function (e, ctx) { return ctx.aux(e & ctx.mask.r); };
            var ctx2 = {
              aux: function (e) { return e >> 2; }
            };
            pjs(sourceArray).map(mapper1, ctx1).map(mapper2, ctx2).seq(function (err, result){
              expect(err).to.equal('Uncaught TypeError: Cannot read property \'r\' of undefined');
              done();
            });
          });
        });
      });
    });
  });
});