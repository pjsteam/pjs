var errors = require('./errors.js');
var utils = require('./utils.js');

var JobPackager = module.exports = function (parts, code, elements) {
  if (!parts) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_PARTS);
  }
  if (!code) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_CODE);
  }
  if (!elements) {
    throw new errors.InvalidArgumentsError(errors.messages.INVALID_ELEMENTS);
  }
  this.parts = parts;
  this.code = code;
  this.elements = elements;
};

JobPackager.prototype.packageForIndex = function (index) {
  if (0 <= index && index < this.parts) {
    return this.packages[index];
  }
  var message = utils.format(errors.messages.INVALID_PACKAGE_INDEX, this.parts);
  throw new errors.InvalidArgumentsError(message);
};

JobPackager.prototype.generatePackages = function () {
  var parts = this.parts;
  var elements = this.elements;
  var packageCode = this.code.toString();
  var elementsType = utils.typeFromTypedArray(elements);

  var packages = new Array(parts);
  for (var index = 0; index < parts; index++) {
    packages[index] = generatePackage(index, packageCode, elements, elementsType);
  }
  this.packages = packages;
};

function generatePackage(index, code, elements, elementsType) {
  return {
    index: index,
    code: code,
    buffer: elements.buffer,
    elementsType: elementsType
  };
};