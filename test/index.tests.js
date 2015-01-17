'use strict';

describe('initialization', function(){

  var pjs;
  var errors = require('../src/errors.js');

  beforeEach(function () {
	pjs = require('../src/index.js');
  });

  afterEach(function () {
	pjs.terminate();
  });

  it('should not have configuration before pjs initialization.', function () {
  	expect(pjs.config).to.equal(undefined);
  });

  it('should have configuration after pjs initialization.', function () {
  	pjs.init();
  	expect(pjs.config).to.not.equal(undefined);
  });

  it('should throw exception after consecutive initialization without termination', function () {
  	pjs.init();
  	expect(pjs.init).to.throw(errors.InvalidOperationError);
  });
  
  // todo testear terminate sin init : tirar exception

  it('should have workers count equal to navigator.hardwareConcurrency if no options are passed.', function () {
  	pjs.init();
  	expect(pjs.config.workers).to.not.equal(undefined);
  	expect(pjs.config.workers).to.not.equal(0);
  	expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
  });

  it('should not have configuration after termination.', function () {
  	pjs.init();
  	expect(pjs.config.workers).to.not.equal(undefined);
  	pjs.terminate();
  	expect(pjs.config).to.equal(undefined);
  });

  it('should have configuration after init-terminate-init cycle.', function () {
  	pjs.init();
  	expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
  	pjs.terminate();
  	expect(pjs.config).to.equal(undefined);
  	pjs.init();
  	expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
  });

  it('should have workers count equal to navigator.hardwareConcurrency - 1 if that value is passed as maxWorkers option.', function () {
  	var max = navigator.hardwareConcurrency - 1;
  	pjs.init({
  		maxWorkers: max
  	});
  	expect(pjs.config.workers).to.not.equal(undefined);
  	expect(pjs.config.workers).to.not.equal(0);
  	expect(pjs.config.workers).to.equal(max);
  });

  it('should have workers count equal to navigator.hardwareConcurrency if navigator.hardwareConcurrency + 3 is passed as maxWorkers option.', function () {
  	pjs.init({
  		maxWorkers: navigator.hardwareConcurrency + 3
  	});
  	expect(pjs.config.workers).to.not.equal(undefined);
  	expect(pjs.config.workers).to.not.equal(0);
  	expect(pjs.config.workers).to.equal(navigator.hardwareConcurrency);
  });

  it('should not be possible to override config property', function () {
  	pjs.init();
  	var overrideWrapper = function () {
  		pjs.config = {};
  	};
  	expect(overrideWrapper).to.throw();
  });

  it('should not be possible to override config.workers property', function () {
  	pjs.init();
  	var overrideWrapper = function () {
  		pjs.config.workers = 0;
  	};
  	expect(overrideWrapper).to.throw();
  });

});

