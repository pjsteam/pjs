var errors = require('./errors');
var utils = require('./utils');
var operation_names = require('./operation_names');
operation_names = Object.keys(operation_names).map(function (k) {
  return operation_names[k];
});

module.exports = function (name, code, seed, identity, identityCode) {
  if (!name || -1 === operation_names.indexOf(name)) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_OPERATION);
  }
  if (!code) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
  }
  if (name === 'reduce' && typeof identityCode === 'undefined') {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_IDENTITY_CODE);
  }
  if (name === 'reduce' && typeof seed === 'undefined') {
    throw new errors.InvalidArgumentsError(errors.messages.MISSING_SEED);
  }
  if (name === 'reduce' && typeof identity === 'undefined') {
    throw new errors.InvalidArgumentsError(errors.messages.MISSING_IDENTITY);
  }

  var toReturn = {
    name: name,
    seed: seed,
    identity: identity,
    identityCode: identityCode
  };

  var key = utils.isFunction(code) ? 'code' : 'functionPath';

  toReturn[key] = code;

  return toReturn;
};
