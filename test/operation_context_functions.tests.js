describe('operation context functions', function(){

  var utils = require('../src/utils');

  var pjs;

  before(function (done) {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});

    pjs.updateContext({
      f: function (x) { return x + 2; },
      g: function (x) { return x <= 2; },
      h: function (x, ctx){
        return ctx.l1.f(x) + 1;
      },
      l1: {
        f: function(x) { return x + 10; },
        g: function(x) { return x > 3; }
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

    it('should fail if context function does not exist', function(done){
      var sourceArray = new Uint32Array([1,2,3,4,5]);
      pjs(sourceArray).map('f.g.h').seq(function(err){
        expect(err.name).to.equal('WorkerError');
        expect(err.message).to.equal('Uncaught Error: Cannot get nested path f.g.h for {"l1":{}}');
        done();
      });
    });
  });
});