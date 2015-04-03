var errors = module.exports = {};

var InvalidOperationError = function InvalidOperationError(message) {
	this.name = 'InvalidOperationError';
	this.message = message || 'Invalid Operation';
};

InvalidOperationError.prototype = new Error();
InvalidOperationError.prototype.constructor = InvalidOperationError;
errors.InvalidOperationError = InvalidOperationError;


var InvalidArgumentsError = function InvalidArgumentsError(message) {
  this.name = 'InvalidArgumentsError';
  this.message = message || 'Invalid Arguments';
};

InvalidArgumentsError.prototype = new Error();
InvalidArgumentsError.prototype.constructor = InvalidArgumentsError;
errors.InvalidArgumentsError = InvalidArgumentsError;

var WorkerError = function WorkerError(message){
  this.name = 'WorkerError';
  this.message = message || 'An unknown error ocurred in the worker';
};

WorkerError.prototype = new Error();
WorkerError.prototype.constructor = WorkerError;
errors.WorkerError = WorkerError;

errors.messages = {
  CONSECUTIVE_INITS: 'You should not recall init if the library is already initialized.',
  TERMINATE_WITHOUT_INIT: 'You should not terminate pjs if it was not initialized before.',
  PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY: 'Expected TypedArray argument.',
  ZERO_ARRAYS_TO_MERGE: 'Zero arrays to merge. Provide at least one.',
  INVALID_PARTS: 'Invalid number of parts.',
  INVALID_CONTEXT: 'Invalid context.',
  PART_ALREADY_COLLECTED: 'Tried to collect part {0} more than once',
  INVALID_CODE: 'Invalid code argument to package.',
  INVALID_IDENTITY_CODE: 'Invalid identity code argument to package.',
  INVALID_ELEMENTS: 'Invalid number of elements to package.',
  INVALID_PACKAGE_INDEX: 'Package index should be not negative and less than {0}.',
  INVALID_TYPED_ARRAY: 'Invalid argument. It should be of TypedArray.',
  INVALID_OPERATION: 'Invalid pjs operation. Possible values are \'filter\', \'map\' or \'reduce\'.',
  INVALID_OPERATIONS: 'Invalid operation chain sent to JobPackager. Either undefined or empty.',
  MISSING_SEED: 'Missing Seed argument for reduce operation packaging.',
  MISSING_IDENTITY: 'Missing Identity argument for reduce operation packaging.',
  INVALID_CHAINING_OPERATION: 'Can not perform more chaining after reduce operation.'
};
