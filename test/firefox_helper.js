'use strict';

module.exports = function (callback) {
  if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    callback();
  }
};
