'use strict';

module.exports = function () {
  var supportedArrays = [
    Uint8Array, 
    Int8Array, 
    Uint8ClampedArray,
    Uint16Array,
    Int16Array,
    Uint32Array,
    Int32Array,
    Float32Array,
    Float64Array
  ];
  var SharedUint8Array = SharedUint8Array || undefined;
  if (SharedUint8Array) {
    var sharedArrays = [
      SharedUint8Array,
      SharedUint8ClampedArray,
      SharedUint16Array,
      SharedUint32Array,
      SharedInt8Array,
      SharedInt16Array,
      SharedInt32Array,
      SharedFloat32Array,
      SharedFloat64Array
    ];
    supportedArrays.concat(sharedArrays);
  }
  return supportedArrays;
};