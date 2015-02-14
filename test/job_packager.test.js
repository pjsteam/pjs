'use strict';

describe.only('job packager', function(){
  var JobPackager = require('../src/job_packager.js');
  var errors = require('../src/errors.js');
  var utils = require('../src/utils.js');

  var parts = 4;
  var code = function (a) { return a + 1; };
  var elements = new Uint32Array([1,2,3,4,5,6,7,8]);

  it('should not be initialized without parts, code and elements', function () {
    expect(function () {
      var packager = new JobPackager();
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      var packager = new JobPackager(parts);
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      var packager = new JobPackager(parts, code);
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      var packager = new JobPackager(parts, code, elements);
    }).to.not.throw(errors.InvalidArgumentsError);
  });

  it('should not generate packages on initialization', function () {
    var packager = new JobPackager(parts, code, elements);

    expect(packager.packages).to.equal(undefined);
  });

  it('should generate ' + parts + ' packages', function () {
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    expect(packager.packages).to.not.equal(undefined);
    expect(packager.packages.length).to.equal(parts);
  });

  it('should return a package for each valid index', function () {
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    for (var i = 0; i < parts; i++) {
      expect(packager.packageForIndex(i)).to.not.equal(undefined);
    }
  });

  it('should not return a package for invalid index', function () {
    var invalidIndex = parts;
    var negativeIndex = -1;
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    expect(function () {
      packager.packageForIndex(invalidIndex);
    }).to.throw(errors.InvalidArgumentsError);
    expect(function () {
      packager.packageForIndex(negativeIndex);
    }).to.throw(errors.InvalidArgumentsError);
  });
  
  it('should track order on all packages', function () {
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    packager.packages.forEach(function (jobPackage, index) {
      expect(jobPackage.index).to.equal(index);
    });
  });

  it('should generate packaged code on all packages', function () {
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    packager.packages.forEach(function (jobPackage) {
      expect(jobPackage.code).to.not.equal(undefined);
    });
  });

  it('should generate packaged buffer on all packages', function () {
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    packager.packages.forEach(function (jobPackage) {
      expect(jobPackage.buffer).to.not.equal(undefined);
    });
  });

  it('should track elements type on all packages', function () {
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    packager.packages.forEach(function (jobPackage, index) {
      expect(jobPackage.elementsType).to.equal(utils.typeFromTypedArray(elements));
    });
  });

  it('should not package elements buffer on the packages', function () {
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    packager.packages.forEach(function (jobPackage) {
      expect(jobPackage.buffer).to.not.equal(elements.buffer);
    });
  });

  it('should generate correct buffer on al packages', function () {
    var elementsConstructor = elements.constructor;
    var packager = new JobPackager(parts, code, elements);
    packager.generatePackages();

    var index = 0;
    packager.packages.forEach(function (jobPackage) {
      var packagedElements = new elementsConstructor(jobPackage.buffer);
      for (var i = 0; i < packagedElements.length; i++, index++) {
        expect(packagedElements[i]).to.equal(elements[index]);
      }
    });
  });
});