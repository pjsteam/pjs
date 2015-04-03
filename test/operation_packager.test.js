'use strict';

describe('operation packager', function () {
  var operationPackager = require('../src/operation_packager');
  var errors = require('../src/errors');

  it('should not package operation without name', function () {
    expect(operationPackager).to.throw(errors.InvalidArgumentsError);
  });

  it('should not package operation without code', function () {
    expect(function () {
      operationPackager('filter');
    }).to.throw(errors.InvalidArgumentsError);
  });

  it('should package filter operation', function () {
    var operation = 'filter';
    var code = function (e) { return true; };
    var pack = operationPackager(operation, code);
    expect(pack.name).to.equal(operation);
    expect(pack.code).to.equal(code);
  });

  it('should package map operation', function () {
    var operation = 'map';
    var code = function (e) { return e + 1; };
    var pack = operationPackager(operation, code);
    expect(pack.name).to.equal(operation);
    expect(pack.code).to.equal(code);
  });

  it('should not package reduce operation without seed', function () {
    var operation = 'reduce';
    var code = function (p, e) { return p + e; };
    expect(function () {
      operationPackager(operation, code);
    }).to.throw(errors.InvalidArgumentsError);
  });

  it('should not package reduce operation without identity', function () {
    var operation = 'reduce';
    var code = function (p, e) { return p + e; };
    var seed = 1;
    expect(function () {
      operationPackager(operation, code, seed);
    }).to.throw(errors.InvalidArgumentsError);
  });

  it('should not package reduce operation without identity code', function () {
    var operation = 'reduce';
    var code = function (p, e) { return p + e; };
    var seed = 1;
    expect(function () {
      operationPackager(operation, code, seed, 0);
    }).to.throw(errors.InvalidArgumentsError);
  });

  it('should package reduce operation', function () {
    var operation = 'reduce';
    var code = function (p, e) { return p + e; };
    var seed = 1;
    var identity = 0;
    var identityCode = function (p, e) { return p + e; };
    expect(function () {
      operationPackager(operation, code, seed, identity, identityCode);
    }).to.not.throw(errors.InvalidArgumentsError);
  });

  it('should package functionPath if code is string an not function', function(){
    var operation = 'map';
    var pack = operationPackager(operation, 'f');
    expect(pack.name).to.equal(operation);
    expect(pack.code).to.be.undefined;
    expect(pack.functionPath).to.equal('f');
  });
});