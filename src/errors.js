var errors = module.exports = {};

InvalidOperationError = function InvalidOperationError(message) {
	this.name = 'InvalidOperationError';
	this.message = message || 'Invalid Operation';
}

InvalidOperationError.prototype = new Error();
InvalidOperationError.prototype.constructor = InvalidOperationError;

errors.InvalidOperationError = InvalidOperationError;

errors.messages = {
  CONSECUTIVE_INITS: 'You should not recall init if the library is already initialized.',
  TERMINATE_WITHOUT_INIT: 'You should not terminate pjs if it was not initialized before.'
};
