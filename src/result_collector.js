var errors = require('./errors.js');
var utils = require('./utils.js');

var Collector = module.exports = function (parts, cb) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }

  if (!cb){
    throw new errors.InvalidArgumentsError(errors.messages.MISSING_CALLBACK);
  }
  this.cb = cb;
  this.parts = parts;
  this.collected = new Array(parts);
  this.completed = 0;
  this.error = null;
};

Collector.prototype.onError = function(message){
  if (!this.error){
    this.error = new errors.WorkerError(message);
  }
  this.updateCompleted();
};

Collector.prototype.onPart = function (data){
  if (this.error) {
    // we don't care about succesful results if an error ocurred
    return this.updateCompleted();
  }

  if (this.collected[data.index]) {
    throw new errors.InvalidArgumentsError(
      utils.format(errors.messages.PART_ALREADY_COLLECTED, data.index));
  }

  this.collected[data.index] = {value: data.value, newLength: data.newLength} ;
  this.updateCompleted();
};

Collector.prototype.updateCompleted = function(){
  if (++this.completed === this.parts){
    if (this.error) {
      return this.cb(this.error);
    }

    return this.cb(null, this.collected);
  }
};