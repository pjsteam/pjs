var worker_core = require('./worker_core');

module.exports = function (self) {
  self.addEventListener('message', function (event){
    var result = worker_core(event);
    if (result.transferables) {
    	self.postMessage(result.message, result.transferables);
    } else {
    	self.postMessage(result.message);
    }
  });
};