'use strict';

describe('Initialization', function(){

	var pjs;

  beforeEach(function () {
	pjs = require('../src/index.js');
  });

  afterEach(function () {
	pjs.terminate();
  });

  it('Should not have configuration before pjs initialization.', function () {
  	expect(pjs.config).to.equal(undefined);
  });

  it('Should have configuration after pjs initialization.', function () {
  	pjs.init();
  	expect(pjs.config).to.not.equal(undefined);
  });

  it('Should throw exception after double initialization', function () {
  	pjs.init();
  	expect(pjs.init).to.throw();
  });
  
  it('Should have workers count equal to navigator.hardwareConcurrency if no options are passed.', function () {
  	pjs.init();
  	expect(pjs.config.workersCount).to.not.equal(undefined);
  	expect(pjs.config.workersCount).to.not.equal(0);
  	expect(pjs.config.workersCount).to.equal(navigator.hardwareConcurrency);
  });

  it('Should not have configuration after termination.', function () {
  	pjs.init();
  	expect(pjs.config.workersCount).to.not.equal(undefined);
  	pjs.terminate();
  	expect(pjs.config).to.equal(undefined);
  });

  it('Should have configuration after init-terminate-init cycle.', function () {
  	pjs.init();
  	expect(pjs.config).to.not.equal(undefined);
  	pjs.terminate();
  	expect(pjs.config).to.equal(undefined);
  	pjs.init();
  	expect(pjs.config).to.not.equal(undefined);
  });

  it('Should have workers count equal to navigator.hardwareConcurrency - 1 if options are passed.', function () {
  	var max = navigator.hardwareConcurrency - 1;
  	pjs.init({
  		maxWorkers: max
  	});
  	expect(pjs.config.workersCount).to.not.equal(undefined);
  	expect(pjs.config.workersCount).to.not.equal(0);
  	expect(pjs.config.workersCount).to.equal(max);
  });

  it('Should have workers count equal to navigator.hardwareConcurrency if navigator.hardwareConcurrency + N are passed as maxworkers option.', function () {
  	pjs.init({
  		maxWorkers: navigator.hardwareConcurrency + 3
  	});
  	expect(pjs.config.workersCount).to.not.equal(undefined);
  	expect(pjs.config.workersCount).to.not.equal(0);
  	expect(pjs.config.workersCount).to.equal(navigator.hardwareConcurrency);
  });

});

