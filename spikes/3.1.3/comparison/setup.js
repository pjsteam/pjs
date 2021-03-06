var pjs = require('p-j-s');
pjs.init();

var generateElements = function (total) {
  var typed = new Uint32Array(total);
  for (var i = total; i > 0; i--){
    typed[i - 1] = 0xdddddddd;
  }
  return typed;
};
var xsLen = 10000000;
var xs = generateElements(xsLen);
var wrappedXs = pjs(xs);

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
  var result = new Uint32Array(l);
  for (var i = 0; i < l; i++) {
    var pixel = pixels[i];
    var r = pixel & 0xFF;
    var g = (pixel & 0xFF00) >> 8;
    var b = (pixel & 0xFF0000) >> 16;

    var noise_r = Math.random() * 0.5 + 0.5;
    var noise_g = Math.random() * 0.5 + 0.5;
    var noise_b = Math.random() * 0.5 + 0.5;

    var new_r = Math.max(Math.min(255, noise_r * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noise_r) * r), 0);
    var new_g = Math.max(Math.min(255, noise_g * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noise_g) * g), 0);
    var new_b = Math.max(Math.min(255, noise_b * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noise_b) * b), 0);

    result[i] = (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
  }
  return result;
};

function runSerial() {
  console.time('serial');
  var r = serialMap(xs, xs.length);
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
    var r = serialMap(xs, xs.length);
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