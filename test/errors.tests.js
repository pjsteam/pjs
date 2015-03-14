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

  it ('should return error if is accidentally thrown', function(done){
    pjs(new Uint32Array([1,2,3,4])).map(function(element){
      return element.inexistent();
    }).seq(function(err){
      expect(err).to.equal('Uncaught TypeError: undefined is not a function');
      done();
    });
  });

  it ('should be able to run another job after one previously failed', function(done){
    pjs(new Uint32Array([1,2,3,4])).map(function(element){
      return element.inexistent();
    }).seq(function(err){
      expect(err).to.equal('Uncaught TypeError: undefined is not a function');

      pjs(new Uint32Array([1,2,3,4])).map(function(e){
        return e * 2;
      }).seq(function(err, result){
        expect(err).to.be.null;
        expect(result).to.have.length(4);
        expect(result[0]).to.equal(2);
        expect(result[1]).to.equal(4);
        expect(result[2]).to.equal(6);
        expect(result[3]).to.equal(8);

        done();
      });
    });
  });
});