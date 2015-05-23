'use strict';

var firefoxHelper = require('./firefox_helper');

firefoxHelper(function () {
  describe('shared map tests', function(){

    var pjs;
    var utils = require('../src/utils.js');

    before(function () {
      pjs = require('../src/index.js');
      pjs.init({maxWorkers:4});
    });

    after(function(){
      if (pjs.config){
        pjs.terminate();
      }
    });

    [SharedUint8Array,
    SharedUint8ClampedArray,
    SharedUint16Array,
    SharedUint32Array,
    SharedInt8Array,
    SharedInt16Array,
    SharedInt32Array,
    SharedFloat32Array,
    SharedFloat64Array].forEach(function (SharedTypedArray) {
      describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(SharedTypedArray)), function(){
        var normalSourceArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
        var sourceArray = new SharedTypedArray(normalSourceArray.length);
        sourceArray.set(normalSourceArray);

        it('Should map shared array', function (done) {
          var mapper = function (e) {
            return e * 3;
          };
          pjs(sourceArray).map(mapper).seq(function (err, result) {
            if (err) { return done(err); }
            normalSourceArray.map(mapper).forEach(function (e, i) {
              expect(result[i]).to.equal(e);
            });
            done();
          });
        });

        it('Should filter shared array', function (done) {
          var predicate = function (e) {
            return e % 2 === 0;
          };
          pjs(sourceArray).filter(predicate).seq(function (err, result) {
            if (err) { return done(err); }
            normalSourceArray.filter(predicate).forEach(function (e, i) {
              expect(result[i]).to.equal(e);
            });
            done();
          });
        });

        it('Should reduce shared array', function (done) {
          var seed = 0;
          var reducer = function (p, e) {
            return p + e;
          };
          pjs(sourceArray).reduce(reducer, seed, 0).seq(function (err, result) {
            if (err) { return done(err); }
            var reduced = normalSourceArray.reduce(reducer, seed);
            expect(result).to.equal(reduced);
            done();
          });
        });

        it('Should map-map shared array', function (done) {
          var mapper1 = function (e) {
            return e * 3;
          };
          var mapper2 = function (e) {
            return e * 2;
          };
          pjs(sourceArray).map(mapper1).map(mapper2).seq(function (err, result) {
            if (err) { return done(err); }
            normalSourceArray.map(mapper1).map(mapper2).forEach(function (e, i) {
              expect(result[i]).to.equal(e);
            });
            done();
          });
        });

        it('Should map-filter shared array', function (done) {
          var mapper = function (e) {
            return e * 3;
          };
          var predicate = function (e) {
            return e % 2 === 0;
          };
          pjs(sourceArray).map(mapper).filter(predicate).seq(function (err, result) {
            if (err) { return done(err); }
            normalSourceArray.map(mapper).filter(predicate).forEach(function (e, i) {
              expect(result[i]).to.equal(e);
            });
            done();
          });
        });

        it('Should map-reduce shared array', function (done) {
          var mapper = function (e) {
            return e * 2;
          };
          var seed = 0;
          var reducer = function (p, e) {
            return p + e;
          };
          pjs(sourceArray).map(mapper).reduce(reducer, seed, 0).seq(function (err, result) {
            if (err) { return done(err); }
            var r = normalSourceArray.map(mapper).reduce(reducer, seed);
            expect(result).to.equal(r);
            done();
          });
        });

        it('Should filter-map shared array', function (done) {
          var predicate = function (e) {
            return e % 2 === 0;
          };
          var mapper = function (e) {
            return e * 3;
          };
          pjs(sourceArray).filter(predicate).map(mapper).seq(function (err, result) {
            if (err) { return done(err); }
            normalSourceArray.filter(predicate).map(mapper).forEach(function (e, i) {
              expect(result[i]).to.equal(e);
            });
            done();
          });
        });

        it('Should filter-filter shared array', function (done) {
          var predicate1 = function (e) {
            return e % 2 === 0;
          };
          var predicate2 = function (e) {
            return e % 3 === 0;
          };
          pjs(sourceArray).filter(predicate1).filter(predicate2).seq(function (err, result) {
            if (err) { return done(err); }
            normalSourceArray.filter(predicate1).filter(predicate2).forEach(function (e, i) {
              expect(result[i]).to.equal(e);
            });
            done();
          });
        });

        it('Should filter-reduce shared array', function (done) {
          var predicate = function (e) {
            return e % 2 === 0;
          };
          var seed = 0;
          var reducer = function (p, e) {
            return p + e;
          };
          pjs(sourceArray).filter(predicate).reduce(reducer, seed, 0).seq(function (err, result) {
            if (err) { return done(err); }
            var r = normalSourceArray.filter(predicate).reduce(reducer, seed);
            expect(result).to.equal(r);
            done();
          });
        });
      });
    });
  });
});