var errors = require('./errors.js');

module.exports = function merge(arrays){
  if (!arrays.length) { throw new errors.InvalidArgumentsError(
    errors.messages.ZERO_ARRAYS_TO_MERGE);
  }
  var first = arrays[0];

  if (arrays.length === 1){
    return first;
  }

  var total = arrays.reduce(function(c,a) { return c + a.length; }, 0);
  var result = new first.constructor(total);
  var start = 0;

  for (var i = 0; i < arrays.length; i++) {
    var array = arrays[i];
    result.set(array, start);
    start += array.length;
  }

  return result;
}