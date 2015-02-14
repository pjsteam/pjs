'use strict';

describe('array partition', function(){
  var Partitioner = require('../src/typed_array_partitioner.js');
  var errors = require('../src/errors.js');

  it('should not be posible to initialize partitioner with not numeric parts argument.', function () {
    expect(function () {
      var partitioner = new Partitioner();
    }).to.throw(errors.InvalidArgumentsError);
  });

  it ('should throw exception for not TypedArray instance of Partitioner.prototype.partition\'s argument', function () {
    var partitioner = new Partitioner(4);
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
    var partitioner = new Partitioner(4);
    [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      expect(function () {
        partitioner.partition(new TypedArray([1, 2, 3, 4]));
      }).to.not.throw();
    });
  });

  it ('should create patitions of the same TypedArray type when calling Partitioner.prototype.partition', function () {
    var partitioner = new Partitioner(4);
    [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
      var arrays = partitioner.partition(new TypedArray([1, 2, 3, 4]));
      arrays.forEach(function (p) {
        expect(p instanceof TypedArray).to.equal(true);
      });
    });
  });

  [1, 2, 3, 4, 6, 8, 16].forEach(function (parts) {
    it('should be initialized with ' + parts + ' parts.', function () {
      var partitioner = new Partitioner(parts);
      expect(partitioner.parts).to.equal(parts);
    });

    it('should partition empty array in ' + parts + ' empty arrays.', function () {
      var partitioner = new Partitioner(parts);
      var arrays = partitioner.partition(new Uint32Array([]));
      expect(arrays.length).to.equal(parts);
      arrays.forEach(function (part) {
        expect(part.length).to.equal(0);
      });
    });

    it('should partition array with a single element in ' + parts + ' arrays.', function () {
      var partitioner = new Partitioner(parts);
      var elements = [1];
      var arrays = partitioner.partition(new Uint32Array(elements));

      expect(arrays.length).to.equal(parts);
    });

    it('should partition array with a single element in ' + parts + ' arrays of 1 or 0 length.', function () {
      var partitioner = new Partitioner(parts);
      var elements = [1];
      var arrays = partitioner.partition(new Uint32Array(elements));

      arrays.forEach(function (part) {
        expect(0 === part.length || 1 === part.length).to.equal(true);
      });
    });

    it('should partition array with a single element in ' + parts + ' arrays which lengths adds up to 1.', function () {
      var partitioner = new Partitioner(parts);
      var elements = [1];
      var arrays = partitioner.partition(new Uint32Array(elements));

      var totalElements = 0;
      arrays.forEach(function (part) {
        totalElements += part.length;
      });
      expect(elements.length).to.equal(totalElements);
    });

    it('should partition array with length of ' + parts + ' into ' + parts + ' arrays of a single element each.', function () {
      var partitioner = new Partitioner(parts);
      var elements = [];
      for (var e = 0; e < parts; e++) {
        elements.push(e);
      }
      var arrays = partitioner.partition(new Uint32Array(elements));

      expect(arrays.length).to.equal(parts);

      arrays.forEach(function (part) {
        expect(1 === part.length).to.equal(true);
      });

      var totalElements = 0;
      arrays.forEach(function (part) {
        totalElements += part.length;
      });
      expect(elements.length).to.equal(totalElements);
    });

    [0, 1, 2, 3, 5, 7, 34, 78, 234, 797, 123123].forEach(function (elementsCount) {
      it('should partition array with length of ' + elementsCount + ' into ' + parts + ' arrays.', function () {
        var partitioner = new Partitioner(parts);
        var elements = [];
        for (var e = 0; e < elementsCount; e++) {
          elements.push(e);
        }
        var arrays = partitioner.partition(new Uint32Array(elements));

        expect(arrays.length).to.equal(parts);

        var totalElements = 0;
        arrays.forEach(function (part) {
          totalElements += part.length;
        });
        expect(elements.length).to.equal(totalElements);
      });
    });
  });
});