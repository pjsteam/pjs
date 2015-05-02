'use strict';

var SharedUint32Array = SharedUint32Array || undefined;

if (SharedUint32Array) {
  describe('map tests', function(){

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

    var normalSourceArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
    var sourceArray = new SharedUint32Array(normalSourceArray);

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
  });
}