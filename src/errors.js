var errors = module.exports = {};

InvalidOperationError = function InvalidOperationError(message) {
	this.name = 'InvalidOperationError';
	this.message = message || 'Invalid Operation';
}
InvalidOperationError.prototype = new Error();
InvalidOperationError.prototype.constructor = InvalidOperationError;
errors.InvalidOperationError = InvalidOperationError;


InvalidArgumentsError = function InvalidArgumentsError(message) {
  this.name = 'InvalidArgumentsError';
  this.message = message || 'Invalid Arguments';
}
InvalidArgumentsError.prototype = new Error();
InvalidArgumentsError.prototype.constructor = InvalidArgumentsError;
errors.InvalidArgumentsError = InvalidArgumentsError;

errors.messages = {
  CONSECUTIVE_INITS: 'You should not recall init if the library is already initialized.',
  TERMINATE_WITHOUT_INIT: 'You should not terminate pjs if it was not initialized before.',
  PARTITIONER_MISSING_PARTS: 'You should call Partitioner(parts) where parts is the number of partitions.',
  PARTITIONER_ARGUMENT_IS_NOT_TYPED_ARRAY: 'You should call Partitioner.prototype.partition() with an TypedArray argument.',
  ZERO_ARRAYS_TO_MERGE: 'You should at least provide one array for the merge.'
};
