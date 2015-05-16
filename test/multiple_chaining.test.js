'use strict';

//TODO: (mati) seguir tests
describe('chaining tests', function(){

  var pjs;
  var utils = require('../src/utils.js');
  var Chain = require('../src/chain');
  var errors = require('../src/errors');

  before(function () {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});
  });

  after(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  it('should properly calculate the result without sibling chains\' interferience', function (done) {
    var xs = new Uint8Array(4);
    xs.set([1,2,3,4]);

    var chain = pjs(xs).map(function(e){
    return e * 3;
    });

    var evenChain = chain.filter(function(e){
    return e % 2 === 0;
    });

    var sumChain = chain.reduce(function(c, v){
    return c + v;
    }, 0, 0);

    evenChain.seq(function (err, evens) {
      expect(evens[0]).to.equal(6);
      expect(evens[1]).to.equal(12);
      done();
    });
  });
});