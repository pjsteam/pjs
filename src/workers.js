var ResultCollector = require('./result_collector');
var work = require('webworkify');

var workers = [];

Object.defineProperty(module.exports, 'length', {
  get: function(){
    return workers.length;
  }
});

module.exports.init = function(workersCount){
  while (workersCount--) {
    var worker = work(require('./worker.js'));
    workers.push(worker);
  }
};

module.exports.terminate = function(){
  workers.forEach(function(w){
    w.terminate();
  });

  workers = [];
};

module.exports.sendPacks = function(packs, callback){
  var collector = new ResultCollector(workers.length, callback);

  packs.forEach(function(pack, index){
    var onMessageHandler = function (event){
      event.target.removeEventListener('error', onErrorHandler);
      event.target.removeEventListener('message', onMessageHandler);
      return collector.onPart(event.data);
    };

    var onErrorHandler = function (event){
      event.preventDefault();
      event.target.removeEventListener('error', onErrorHandler);
      event.target.removeEventListener('message', onMessageHandler);
      return collector.onError(event.message);
    };

    workers[index].addEventListener('error', onErrorHandler);
    workers[index].addEventListener('message', onMessageHandler);

    workers[index].postMessage(pack);
  });
};