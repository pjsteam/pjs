'use strict';

describe('array merge', function(){
  var merge = require('../src/typed_array_merger.js');
  var errors = require('../src/errors.js');

  it('should not be posible to merge with empty array', function () {
    expect(function () {
      merge([]);
    }).to.throw(errors.InvalidArgumentsError);
  });

  it('should return same array if only one array to merge', function(){
    var array = new Uint32Array([1,2,3]);
    var toMerge = [ array ];

    var merged = merge(toMerge);

    expect(merged.length).to.equal(array.length);
    for (var i = merged.length - 1; i >= 0; i--) {
      expect(merged[i]).to.equal(array[i]);
    };
  });

  it ('should merge seven arrays', function(){
    var lengths = [0, 1, 2, 100, 200, 500, 1000];

    var toMerge = lengths.map(function(l){
      var r = new Uint32Array(l);
      for (var i = 0; i < l; i++){ r[l] = i; }
      return r;
    });

    var expected_length = lengths.reduce(function(c,v) { return c + v; }, 0);

    var merged = merge(toMerge);

    expect(merged.length).to.equal(expected_length);

    var currentArray = 0, currentSum = 0;

    for (var i = 0; i < expected_length; i++) {
      if (currentSum >= lengths[currentArray]){
        currentSum = 0;
        currentArray++;
      }

      expect(merged[i]).to.equal(toMerge[currentArray][currentSum]);
    };
  })
});