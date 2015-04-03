describe('operation context functions', function(){

  var utils = require('../src/utils');

  var pjs;

  before(function (done) {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});

    pjs.updateContext({
      f: function (x) { return x + 2; },
      g: function (x) { return x <= 2; },
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

    it.skip('should be able to execute nested function', function(done){
      done();
    });

    it.skip('should be able context function then parameter function', function(done){
      done();
    });

    it.skip('should be able parameter function then context function', function(done){
      done();
    });

    it.skip('should be able to use context from context function', function(done){
      done();
    });

    it.skip('should fail if context function does not exist', function(){

    });
  });
});