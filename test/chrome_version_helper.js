'use strict';

module.exports = function (minVersion, callback) {
  var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
  if(chromeVersion && chromeVersion > minVersion){
    callback();
  }
};
