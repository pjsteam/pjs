'use strict';

describe('global context tests', function(){

  var pjs;
  var utils = require('../src/utils.js');

  before(function (done) {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});

    pjs.updateContext({
      add2: function (x) { return x + 2; },
      cond: {
        lower: function(x) { return x > 3; },
        upper: function(x) { return x < 5; }
      },
      max: 5
    }, done);
  });

  after(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  it('should add function to context', function(done){
    var sourceArray = new Uint32Array([1,2,3,4,5]);
    pjs(sourceArray).map(function(e, ctx){
      return ctx.add2(e);
    }).seq(function(err, result){
      if (err) { return done(err); }
      expect(result).to.have.length(sourceArray.length);
      expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
      for (var i = sourceArray.length - 1; i >= 0; i--) {
        expect(result[i]).to.equal(sourceArray[i] + 2);
      }
      done();
    });
  });

  it('should have context available for all chain steps', function(done){
    var sourceArray = new Uint32Array([1,2,3,4,5]);
    pjs(sourceArray).map(function(e, ctx){
      return ctx.add2(e);
    }).filter(function(e, ctx){
      return e <= ctx.max;
    }).seq(function(err, result){
      if (err) { return done(err); }
      expect(result).to.have.length(3);
      expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
      for (var i = 0; i < 3; i++) {
        expect(result[i]).to.equal(sourceArray[i] + 2);
      }
      done();
    });
  });

  it('should have nested functions context available for all chain steps', function(done){
    var sourceArray = new Uint32Array([1,2,3,4,5]);
    pjs(sourceArray).map(function(e, ctx){
      return ctx.add2(e);
    }).filter(function(e, ctx){
      return ctx.cond.lower(e) && ctx.cond.upper(e);
    }).seq(function(err, result){
      if (err) { return done(err); }
      expect(result).to.have.length(1);
      expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
      expect(result[0]).to.equal(4);
      done();
    });
  });

  it('should have context available for different chains', function(done){
    var sourceArray = new Uint32Array([1,2,3,4,5]);

    var wrapped = pjs(sourceArray);

    wrapped.map(function(e, ctx){
      return ctx.add2(e) + 1;
    }).seq(function(err, result){
      if (err) { return done(err); }

      expect(result).to.have.length(sourceArray.length);
      expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
      for (var i = sourceArray.length - 1; i >= 0; i--) {
        expect(result[i]).to.equal(sourceArray[i] + 3);
      }

      wrapped.filter(function(e, ctx){
        return ctx.add2(e) < ctx.max;
      }).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(2);
        expect(result[0]).to.equal(1);
        expect(result[1]).to.equal(2);

        done();
      });
    });
  });

  it('should be able to delete from global context', function(done){
    pjs.updateContext({
      max: undefined
    }, function(err){
      if (err) { return done(err); }
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map(function(e, ctx){
        if (typeof ctx.map === 'undefined'){
          return 1;
        }

        return 0;
      }).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(sourceArray.length);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = sourceArray.length - 1; i >= 0; i--) {
          expect(result[i]).to.equal(1);
        }

        done();
      });
    });
  });

  it('should be able to update global context', function(done){
    pjs.updateContext({
      max: 8
    }, function(err){
      if (err) { return done(err); }
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).filter(function(e, ctx){
        return ctx.add2(e) < ctx.max;
      }).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(sourceArray.length);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = sourceArray.length - 1; i >= 0; i--) {
          expect(result[i]).to.equal(sourceArray[i]);
        }

        done();
      });
    });
  }); 
});