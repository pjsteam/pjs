// 2.3.1 Particion de ArrayBuffer

Manual
  var ab = new Uint8Array([1,2,3,4]);
  var r = new Uint8Array(ab.length);
  for (var i = 0; i < ab.length; i++) {
    r[i] = ab[i];
  }

ArrayBuffer slice // https://www.khronos.org/registry/typedarray/specs/latest/#5
var ab = new Uint8Array([1,2,3,4]);
var b = ab.buffer.slice(0);
var r  = new Uint8Array(b);

new TypeArray() from buffer
  var ab = new Uint8Array([1,2,3,4]);
  var r = new Uint8Array(ab.buffer, 0, ab.length);

new TypeArray() from array like
  var ab = new Uint8Array([1,2,3,4]);
  var r = new Uint8Array(ab);

ArrayBuffer set
  var ab = new Uint8Array([1,2,3,4]);
  var r = new Uint8Array(ab.length);
  r.set(ab);

subArray + new TypeArray(typeArray)
  var ab = new Uint8Array([1,2,3,4]);
  var s = ab.subarray();
  var r = new Uint8Array(s.buffer, 0, ab.length);

Blob slice
  var ab = new Uint8Array([1,2,3,4]);
  var b = new Blob([ab.buffer]);
  var r;
  var fileReader = new FileReader();
  fileReader.onload = function() {
      r = this.result;
  };
  fileReader.readAsArrayBuffer(b);