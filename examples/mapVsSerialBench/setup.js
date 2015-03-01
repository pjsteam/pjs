var pjs = require('p-j-s');
pjs.init();



var generateElements = function (total) {
  var typed = new Uint8ClampedArray(total * 4);
  for (var i = total * 4; i > 0; i--){
    typed[i - 1] = 0xdd;
  }
  return typed;
};
var xsLen = 8000000;
var xs = generateElements(xsLen);
var wrappedXs = pjs(new Uint32Array(xs.buffer));

function mapper(pixel) {
  var r = pixel & 0xFF;
  var g = (pixel & 0xFF00) >> 8;
  var b = (pixel & 0xFF0000) >> 16;

  var noise_r = Math.random() * 0.5 + 0.5;
  var noise_g = Math.random() * 0.5 + 0.5;
  var noise_b = Math.random() * 0.5 + 0.5;

  var new_r = Math.max(Math.min(255, noise_r * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noise_r) * r), 0);
  var new_g = Math.max(Math.min(255, noise_g * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noise_g) * g), 0);
  var new_b = Math.max(Math.min(255, noise_b * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noise_b) * b), 0);

  return (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
};

function serialMap(pixels, l) {
  var result = new Uint8ClampedArray(l);
  for (var i = 0; i < l; i += 4) {
    var r = pixels[i];
    var g = pixels[i + 1];
    var b = pixels[i + 2];

    var noise_r = Math.random() * 0.5 + 0.5;
    var noise_g = Math.random() * 0.5 + 0.5;
    var noise_b = Math.random() * 0.5 + 0.5;

    result[i] = Math.max(Math.min(255, noise_r * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noise_r) * r), 0);
    result[i + 1] = Math.max(Math.min(255, noise_g * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noise_g) * g), 0);
    result[i + 2] = Math.max(Math.min(255, noise_b * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noise_b) * b), 0);
  }
  return result;
};

function runSerial() {
  console.log('elements: ', xs.length);
  console.time('serial');
  var r = serialMap(xs, xsLen * 4);
  console.timeEnd('serial');
  if (0 === r.length) {
    console.log('error');
  }
};

function runPjs() {
  console.time('pjs');
  wrappedXs.map(mapper, function (r) {
    console.timeEnd('pjs');
  });
};

var samplesCount = 100;
function runSerialInLoop() {
  var n = samplesCount;
  console.time('serial-loop');
  for (var i = 0; i < n; i += 1) {
    var r = serialMap(xs, xsLen * 4);
  }
  console.timeEnd('serial-loop');
};

function runPjsInLoop() {
  var n = samplesCount;
  var it = n;
  console.time('pjs-loop');
  runInnerPjsInLoop(it);
};

function runInnerPjsInLoop (it) {
  if (0 === it) {
    console.timeEnd('pjs-loop');
    return;
  }
  wrappedXs.map(mapper, function (r) {
    runInnerPjsInLoop(it - 1);
  });
};


infoElements.innerHTML = 'Elements count = ' + xsLen;
infoLoops.innerHTML = 'Loops count = ' + samplesCount;