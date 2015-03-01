'use strict';

describe('worker core', function(){
  var worker = require('../src/worker_core');
  var utils = require('../src/utils');
  var JobPackager = require('../src/job_packager');

  [Uint8Array, Int8Array, Uint8ClampedArray,
    Uint16Array, Int16Array,
    Uint32Array, Int32Array,
    Float32Array, Float64Array].forEach(function (TypedArray) {
    describe(utils.format('tests for {0}', utils.getTypedArrayConstructorType(TypedArray)), function(){
      var parts = 4;
      var code = function (a) { return a + 1; };
      var packageIndex = 3, result;
      var elements = new TypedArray([1,2,3,4,5,6,7,8]);
      var packager = new JobPackager(parts, code, elements, 'map');
      var packages = packager.generatePackages();

      var expectedElements = new TypedArray([8,9]);

      var jobPackage = packages[packageIndex];
      before(function(){
        result = worker({data: jobPackage});
      });

      it('should add index to result object', function () {
        expect(result.message.index).to.equal(packageIndex);
      });

      it('should add transferables to result object', function () {
        expect(result.transferables).to.not.be.undefined;
        expect(result.transferables.length).to.equal(1);
        expect(result.transferables[0]).to.equal(result.message.value);
      });

      it('should transform array elements', function () {
        var transformedElements = new TypedArray(result.message.value);
        expect(transformedElements.length).to.equal(expectedElements.length);
        for (var i = 0; i < expectedElements.length; i++) {
          expect(transformedElements[i]).to.equal(expectedElements[i]);
        }
      });
    });
  });
});