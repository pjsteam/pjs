'use strict';

describe('error tests', function(){

  var pjs;

  beforeEach(function () {
    pjs = require('../src/index.js');
    pjs.init({maxWorkers:4});
  });

  afterEach(function(){
    if (pjs.config){
      pjs.terminate();
    }
  });

  it ('should return error if is thrown as first seq done parameter', function(done){
    pjs(new Uint32Array([1,2,3,4])).map(function(){
      throw new Error('Failed');
    }).seq(function(err){
      expect(err).to.equal('Uncaught Error: Failed');
      done();
    });
  });
});