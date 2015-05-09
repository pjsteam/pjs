'use strict';

module.exports = function (minVersion, callback) {
  var match = window.navigator.appVersion.match(/Chrome\/(\d+)\./);
  if (match) {
    var chromeVersion = parseInt(match[1], 10);
    if(chromeVersion && chromeVersion > minVersion){
      callback();
    }
  }
};
