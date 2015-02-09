'use strict';

describe('result collector', function(){
  var Collector = require('../src/result_collector.js');
  var errors = require('../src/errors.js');

  it('should not be posible to collect with empty parts and callback', function () {
    expect(function () {
      new Collector();
    }).to.throw(errors.InvalidArgumentsError);
  });

  it('should not be posible to collect with empty callback', function () {
    expect(function () {
      new Collector(4);
    }).to.throw(errors.InvalidArgumentsError);
  });

  it('should be initialized with parts', function () {
    var parts = 4;
    var collector = new Collector(parts, function () {});

    expect(collector.parts).to.equal(parts);
  });

  it('should be initialized with empty collected array', function () {
    var parts = 4;
    var collector = new Collector(parts, function () {});

    expect(collector.collected.length).to.equal(parts);
    collector.collected.forEach(function (part) {
      expect(part).to.be(undefined);
    });
  });

  it('should not be completed on initialization', function () {
    var parts = 4;
    var collector = new Collector(parts, function () {});

    expect(collector.completed).to.equal(0);
    expect(collector.completed).to.not.equal(parts);
  });

  it('should add to completed on completed part', function () {
    var parts = 2;
    var collector = new Collector(parts, function () {});

    collector.onPart({index: 0, elements: new Uint8Array([0,1])});

    expect(collector.completed).to.equal(1);
    expect(collector.completed).to.not.equal(parts);

    collector.onPart({index: 1, elements: new Uint8Array([2,3])});

    expect(collector.completed).to.equal(parts);
  });

  it('should not fail if same part is sent twice', function () {
    var parts = 2;
    var collector = new Collector(parts, function () {});

    collector.onPart({index: 0, elements: new Uint8Array([0,1])});

    expect(collector.completed).to.equal(1);
    expect(collector.completed).to.not.equal(parts);

    expect(function(){
      collector.onPart({index: 0, elements: new Uint8Array([2,3])});
    }).to.throw();
  });

  it('should invoke callback when all parts are completed', function () {
    var parts = 3;
    var callback_invoked = false, result;
    var collector = new Collector(parts, function (res) {
      callback_invoked = true;
      result = res;
    });

    collector.onPart({index: 2, elements: new Uint8Array([4,5])});
    expect(callback_invoked).to.equal(false);

    collector.onPart({index: 0, elements: new Uint8Array([0,1])});
    expect(callback_invoked).to.equal(false);

    collector.onPart({index: 1, elements: new Uint8Array([2,3])});
    expect(callback_invoked).to.equal(true);

    expect(result[0][0]).to.equal(0);
    expect(result[0][1]).to.equal(1);
    expect(result[1][0]).to.equal(2);
    expect(result[1][1]).to.equal(3);
    expect(result[2][0]).to.equal(4);
    expect(result[2][1]).to.equal(5);
  });
});