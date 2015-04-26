'use strict';

describe('chain context tests', function() {
  var contextUtils = require('../src/chain_context');
  var utils = require('../src/utils');

  it ('should create a first chain context with a local context', function () {
    var depth = 0;
    var firstChain = contextUtils.extendChainContext(depth, {name:'test', age: 8});
    expect(firstChain).to.not.be.undefined;
    expect(firstChain[depth]).to.not.be.undefined;
  });

  it ('should create a second chain context with local contexts', function () {
    var firstDepth = 0;
    var firstChain = contextUtils.extendChainContext(firstDepth, {name:'test', age: 8});
    var secondDepth = 1;
    var secondChain = contextUtils.extendChainContext(secondDepth, {max: 8, min: 16}, firstChain);
    expect(secondChain).to.not.be.undefined;
    expect(secondChain[firstDepth]).to.not.be.undefined;
    expect(secondChain[secondDepth]).to.not.be.undefined;
  });

  it ('should not create any context with empty first local context', function () {
    var firstChain = contextUtils.extendChainContext();
    expect(firstChain).to.be.undefined;
  });

  it ('should not create any context with empty first and second local contexts', function () {
    var firstChain = contextUtils.extendChainContext(0);
    var secondChain = contextUtils.extendChainContext(1, undefined, firstChain);
    expect(secondChain).to.be.undefined;
  });

  it ('should create a context from empty first local contexts', function () {
    var firstDepth = 0;
    var firstChain = contextUtils.extendChainContext(firstDepth);
    var secondDepth = 1;
    var secondChain = contextUtils.extendChainContext(secondDepth, {name:'test', age: 8}, firstChain);
    expect(firstChain).to.be.undefined;
    expect(secondChain).to.not.be.undefined;
    expect(secondChain[firstDepth]).to.be.undefined;
    expect(secondChain[secondDepth]).to.not.be.undefined;
  });

  describe('retrieve local context', function () {
    var firstLocalContext = {
      max: 8,
      min: 2
    };
    var secondContext = null;
    var thirdContext = {
      minimize: function (e) {
        return Math.min(e, 4);
      }
    }

    var firstChain = contextUtils.extendChainContext(0, firstLocalContext);
    var secondChain = contextUtils.extendChainContext(1, secondContext, firstChain);
    var thirdChain = contextUtils.extendChainContext(2, thirdContext, secondChain);

    it ('should retrieve first context from first chain', function () {
      var c = contextUtils.contextFromChainContext(0, firstChain);
      expect(c).to.not.be.undefined;
      expect(c.max).to.equal(8);
      expect(c.min).to.equal(2);
    });

    it ('should retrieve second context from second chain', function () {
      var c = contextUtils.contextFromChainContext(1, secondChain);
      expect(c).to.be.undefined;
    });

    it ('should retrieve third context from third chain', function () {
      var c = contextUtils.contextFromChainContext(2, thirdChain);
      expect(c).to.not.be.undefined;
      expect(c.minimize).to.not.be.undefined;
      expect(c.minimize(5)).to.equal(4);
      expect(c.minimize(3)).to.equal(3);
      expect(c.minimize(1)).to.equal(1);
    });

    it ('should should generate a sibling chain from second chain', function () {
      var thirdContextBis = {
        maximize: function (e) {
          return Math.max(e, 4);
        }
      }
      var thirdChainBis = contextUtils.extendChainContext(2, thirdContextBis, secondChain);

      var c = contextUtils.contextFromChainContext(2, thirdChain);
      expect(c).to.not.be.undefined;
      expect(c.minimize).to.not.be.undefined;
      expect(c.minimize(5)).to.equal(4);
      expect(c.minimize(3)).to.equal(3);
      expect(c.minimize(1)).to.equal(1);

      var cBis = contextUtils.contextFromChainContext(2, thirdChainBis);
      expect(cBis).to.not.be.undefined;
      expect(cBis.maximize).to.not.be.undefined;
      expect(cBis.maximize(5)).to.equal(5);
      expect(cBis.maximize(3)).to.equal(4);
      expect(cBis.maximize(1)).to.equal(4);
    });
  });

  describe('expand contexts with functions', function () {
    var chainContext;
    var chainFirstLocalContext;

    before(function () {
      var localContext = {
        minimize: function (e) {
          return Math.min(e, 4);
        },
        adder: function (a, b) {
          return Math.min(e, 4);
        },
        random: function () {
          return Math.random();
        },
        foo: function (a, b, c, d, e, f) {
          return a + b + c * d / e + f;
        }
      }
      chainContext = contextUtils.extendChainContext(0, localContext);
      chainFirstLocalContext = chainContext[0];
    });

    it ('should parse functions on local context', function () {
      var c = chainFirstLocalContext;
      expect(utils.isFunction(c.minimize)).to.be.false;
      expect(utils.isFunction(c.adder)).to.be.false;
      expect(utils.isFunction(c.random)).to.be.false;
      expect(utils.isFunction(c.foo)).to.be.false;
    });

    it ('should obtain functions on local context', function () {
      var c = contextUtils.contextFromChainContext(0, chainContext);
      expect(utils.isFunction(c.minimize)).to.be.true;
      expect(utils.isFunction(c.adder)).to.be.true;
      expect(utils.isFunction(c.random)).to.be.true;
      expect(utils.isFunction(c.foo)).to.be.true;
    });
  });
});