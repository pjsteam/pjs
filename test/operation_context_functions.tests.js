describe('operation context functions', function(){

  var utils = require('../src/utils');

  var pjs;

  var chromeHelper = require('./chrome_version_helper');

  before(function (done) {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});

    pjs.updateContext({
      f: function (x) { return x + 2; },
      g: function (x) { return x <= 2; },
      h: function (x, ctx) {
        return ctx.l1.f(x) + 1;
      },
      i: function (x, ctx) {
        return ctx.l1.g(x);
      },
      l1: {
        f: function(x) { return x + 10; },
        g: function(x) { return x >= 3; },
        r: function(c, x) { return c + x + 10; }
      },
      r: function(c, x){
        return c + x + 2;
      },
      s: function(c, x, ctx){
        return c + ctx.f(x);
      }
    }, done);
  });

  after(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  describe('map', function(){
    it('should be able to execute not nested function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map('f').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(sourceArray.length);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = sourceArray.length - 1; i >= 0; i--) {
          expect(result[i]).to.equal(sourceArray[i] + 2);
        }
        done();
      });
    });

    it('should be able to execute nested function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map('l1.f').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(sourceArray.length);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = sourceArray.length - 1; i >= 0; i--) {
          expect(result[i]).to.equal(sourceArray[i] + 10);
        }
        done();
      });
    });

    it('should be able context function then parameter function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map('f').map(function(e){
        return e + 3;
      }).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(sourceArray.length);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = sourceArray.length - 1; i >= 0; i--) {
          expect(result[i]).to.equal(sourceArray[i] + 5);
        }
        done();
      });
    });

    it('should be able parameter function then context function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map(function(e){
        return e + 3;
      }).map('f').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(sourceArray.length);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = sourceArray.length - 1; i >= 0; i--) {
          expect(result[i]).to.equal(sourceArray[i] + 5);
        }
        done();
      });
    });

    it('should be able to use context from context function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map('h').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(sourceArray.length);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = sourceArray.length - 1; i >= 0; i--) {
          expect(result[i]).to.equal(sourceArray[i] + 11);
        }
        done();
      });
    });

    chromeHelper(39, function(){
      it('should fail if context function does not exist', function(done){
        var sourceArray = new Uint32Array([1,2,3,4,5]);
        pjs(sourceArray).map('f.g.h').seq(function(err){
          expect(err.name).to.equal('WorkerError');
          expect(err.message).to.match(/(Uncaught )?Error: Cannot get nested path f.g.h from context/);
          done();
        });
      });
    });
  });

  describe('filter', function(){
    it('should be able to execute not nested function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).filter('g').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(2);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = 0; i < 2; i++) {
          expect(result[i]).to.equal(sourceArray[i]);
        }
        done();
      });
    });

    it('should be able to execute nested function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).filter('l1.g').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(3);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = 0; i < 3; i++) {
          expect(result[i]).to.equal(sourceArray[i + 2]);
        }
        done();
      });
    });

    it('should be able context function then parameter function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).filter('g').filter(function(e){
        return e > 1;
      }).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(1);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = 0; i < 1; i++) {
          expect(result[i]).to.equal(sourceArray[i + 1]);
        }
        done();
      });
    });

    it('should be able parameter function then context function', function(done){
     var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).filter(function(v){
        return v > 3;
      }).filter('l1.g').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(2);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = 0; i < 2; i++) {
          expect(result[i]).to.equal(sourceArray[i + 3]);
        }
        done();
      });
    });

    it('should be able to use context from context function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).filter('i').seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.have.length(3);
        expect(utils.getTypedArrayType(result)).to.equal(utils.getTypedArrayType(sourceArray));
        for (var i = 0; i < 3; i++) {
          expect(result[i]).to.equal(sourceArray[i + 2]);
        }
        done();
      });
    });

    chromeHelper(39, function(){
      it('should fail if context function does not exist', function(done){
        var sourceArray = new Uint32Array([1,2,3,4,5]);
        pjs(sourceArray).filter('g.h.i').seq(function(err){
          expect(err.name).to.equal('WorkerError');
          expect(err.message).to.match(/(Uncaught )?Error: Cannot get nested path g.h.i from context/);
          done();
        });
      });
    });
  });

  describe('reduce', function(){
    it('should be able to execute not nested function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).reduce('r', 0, function(c, v){
        return c + v;
      }, 0).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.equal(25);
        done();
      });
    });

    it('should be able to execute nested function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).reduce('l1.r', 0, function(c, v){
        return c + v;
      }, 0).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.equal(65);
        done();
      });
    });

    it('should be able context function then parameter function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map('f').reduce(function(c, v){
        return c * v;
      }, 1, 1).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.equal(2520);
        done();
      });
    });

    it('should be able parameter function then context function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map(function(e){
        return e + 3;
      }).reduce('r', 0, function(c,v) { return c + v; }, 0)
      .seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.equal(40);
        done();
      });
    });

    it('should be able to use context from context function', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).reduce('s', 0, function(c,v){
        return c + v;
      }, 0).seq(function(err, result){
        if (err) { return done(err); }
        expect(result).to.equal(25);
        done();
      });
    });

    chromeHelper(39, function(){
      it('should fail if context function does not exist', function(done){
        var sourceArray = new Uint32Array([1,2,3,4,5]);
        pjs(sourceArray).reduce('r.s.t', 0, 0).seq(function(err){
          expect(err.name).to.equal('WorkerError');
          expect(err.message).to.match(/(Uncaught )?Error: Cannot get nested path r.s.t from context/);
          done();
        });
      });
    });
  });
});