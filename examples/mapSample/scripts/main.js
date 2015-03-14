require(["https://rawgit.com/pjsteam/pjs/v0.2.1/dist/p-j-s-standalone.min.js"], function(pjs) {
  pjs.init();
  function mapper (e) { 
    return e + Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000);
  };

  function generateElements(count) {
    var xs = new Uint32Array(count);
    for (var i = 0; i < count; i++) {
      xs[i] = i;
    }
    return xs;
  };

  function arrayToString(array, max) {
    max = max || array.length;
    var result = '[';
    for (var i = 0; i < max && i < array.length; i++) {
      if (0 === i) {
        result += array[i];
      } else {
        result += ' , ' + array[i];
      }
    }
    return result + ']';
  };

  var xs;

  function generate () {
    var count = document.getElementById("select").value;
    xs = generateElements(count);
    document.getElementById("xs").innerHTML = 'xs = ' + arrayToString(xs, 150);
    document.getElementById("mapper").innerHTML = 'mapper = ' + mapper.toString();
  }

  function pjsmap () {
    initIfNeeded();

    console.time('pjs');
    var s = new Date();
    pjs(xs).map(mapper, function (ys) {
      console.timeEnd('pjs');
      finish(ys, s, 'pjs(xs).map');
    });
  };

  function formap () {
    initIfNeeded();

    console.time('for');
    var s = new Date();
    var l = xs.length;
    var ys = new Uint32Array(l);
    for (var i = 0; i < l; i++){
      ys[i] = mapper(xs[i]);
    }
    console.timeEnd('for');
    finish(ys, s, 'for map');
  };

  function initIfNeeded () {
    if (!xs) {
      generate();
    }
  };

  function finish(ys, s, m) {
    var e = new Date();
    document.getElementById("ys").innerHTML = 'ys = ' + arrayToString(ys, 150);
    document.getElementById("time").innerHTML = m + ' time = ' + (e - s) + ' ms';
  };

  document.getElementById("generate").onclick = generate;
  document.getElementById("pjsmap").onclick = pjsmap;
  document.getElementById("formap").onclick = formap;
});