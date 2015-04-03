var errors = require('./errors');
var contextUtils = require('./context');

var ContextUpdatePackager = module.exports = function (parts) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  this.parts = parts;
};

ContextUpdatePackager.prototype.generatePackages = function (contextUpdate) {
  if (!contextUpdate) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CONTEXT);
  }

  var parts = new Array(this.parts);

  for (var i = 0; i < this.parts; i++) {
    parts[i] = {
      index: i,
      contextUpdate: JSON.stringify(contextUtils.serializeFunctions(contextUpdate))
    };
  }

  return parts;
};
