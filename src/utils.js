var utils = module.exports = {};

utils.getter = function (obj, name, value) {
  Object.defineProperty(obj, name, {
    enumerable: true,
    configurable: true,
    get: function () {
      return value;
    }
  });
};