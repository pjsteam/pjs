'use strict';

describe('job packager', function(){
  var JobPackager = require('../src/job_packager.js');
  var errors = require('../src/errors.js');
  var utils = require('../src/utils.js');

  var parts = 4;
  var code = function (a) { return a + 1; };
  var elements = new Uint32Array([1,2,3,4,5,6,7,8]);
  var packager = new JobPackager(parts, code, elements);
  var packages = packager.generatePackages();

  it('should not be initialized without parts, code and elements', function () {
    expect(function () {
      var p = new JobPackager();
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      var p = new JobPackager(parts);
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      var p = new JobPackager(parts, code);
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      var p = new JobPackager(parts, code, elements);
    }).to.not.throw(errors.InvalidArgumentsError);
  });

  it('should generate ' + parts + ' packages', function () {
    expect(packages).to.not.be.undefined;
    expect(packages.length).to.equal(parts);
  });

  it('should return a package for each valid index', function () {
    var invalidIndex = parts;
    var negativeIndex = -1;

    for (var i = 0; i < parts; i++) {
      expect(packages[i]).to.not.be.undefined;
    }
    expect(packages[invalidIndex]).to.be.undefined;
    expect(packages[negativeIndex]).to.be.undefined;
  });

  it('should track order on all packages', function () {
    packages.forEach(function (jobPackage, index) {
      expect(jobPackage.index).to.equal(index);
    });
  });

  it('should generate packaged code on all packages', function () {
    packages.forEach(function (jobPackage) {
      expect(jobPackage.code).to.not.be.undefined;
    });
  });

  it('should generate packaged buffer on all packages', function () {
    packages.forEach(function (jobPackage) {
      expect(jobPackage.buffer).to.not.be.undefined;
    });
  });

  it('should track elements type on all packages', function () {
    packages.forEach(function (jobPackage, index) {
      expect(jobPackage.elementsType).to.equal(utils.getTypedArrayType(elements));
    });
  });

  it('should not package elements buffer on the packages', function () {
    packages.forEach(function (jobPackage) {
      expect(jobPackage.buffer).to.not.equal(elements.buffer);
    });
  });

  it('should not lose or duplicate data on packaged buffers', function () {
    var elementsConstructor = elements.constructor;

    var index = 0;
    packages.forEach(function (jobPackage) {
      var packagedElements = new elementsConstructor(jobPackage.buffer);
      for (var i = 0; i < packagedElements.length; i++, index++) {
        expect(packagedElements[i]).to.equal(elements[index]);
      }
    });
    expect(index).to.equal(elements.length);
  });
});