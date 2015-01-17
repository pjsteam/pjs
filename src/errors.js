var errors = module.exports = {};
	
InvalidOperationError = function InvalidOperationError(message) {
	this.name = 'InvalidOperationError';
	this.message = message || 'Invalid Operation';
}
InvalidOperationError.prototype = new Error();
InvalidOperationError.prototype.constructor = InvalidOperationError;

errors.InvalidOperationError = InvalidOperationError;
