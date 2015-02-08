'use strict';

describe('array partition', function(){
  
  var parts = 2;
  
  var Partitioner = require('../src/typed_array_partitioner.js');
  var errors = require('../src/errors.js');

  it('should be initialized with ' + parts + ' parts.', function () {
    var partitioner = new Partitioner(parts);
    expect(partitioner.parts).to.equal(parts);
  });

  it('should not be possible to override parts property', function () {
    var partitioner = new Partitioner(parts);
    expect(function () {
      partitioner.parts = 2;
    }).to.throw();
  });

  it('should initialize parts correctly', function () {
    [0, 1, 2, 3, 4, 6, 8].forEach(function (p) {
      var partitioner = new Partitioner(p);
      expect(partitioner.parts).to.equal(p);
    });
  });

  it('should not be posible to initialize partitioner with not numeric parts argument.', function () {
    expect(function () {
      var partitioner = new Partitioner();
    }).to.throw(errors.InvalidArgumentsError);
  });

  it ('should throw exception for not TypedArray instance of Partitioner.prototype.partition\'s argument', function () {
    var partitioner = new Partitioner(parts);
    expect(function () {
      partitioner.partition(null);
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      partitioner.partition(undefined);
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      partitioner.partition({});
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      partitioner.partition(function () {});
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      partitioner.partition([1,3,5]);
    }).to.throw(errors.InvalidArgumentsError);
  });

  it ('should not throw exception for supported TypedArrays when calling Partitioner.prototype.partition', function () {
    var partitioner = new Partitioner(parts);
    [Uint8Array, Int8Array, Uint8ClampedArray, 
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      expect(function () {
        partitioner.partition(new TypedArray([1, 2, 3, 4]));
      }).to.not.throw();
    });
  });

  it('should partition empty array in ' + parts + ' empty arrays.', function () {
    var partitioner = new Partitioner(parts);
    var arrays = partitioner.partition(new Uint32Array([]));
    expect(arrays.length).to.equal(parts);
    arrays.forEach(function (part) {
      expect(part.length).to.equal(0);
    });
  });

});




/*
var p = new ArraySaraza(parts: 4);

var parts = p.partition(new Uint32Array([1,2,3,4]));

parts === 4;
parts 

[1,2,3,4,8].forEach(function(parts){
it ('should work with ' + parts + ' parts', function(){

})
})
*/