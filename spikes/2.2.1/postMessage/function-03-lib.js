var ww = (function () {
  var wCode = function (event) {
    var elements = event.data.elements;
    var bufferedCode = event.data.code;
    var arg = event.data.arg;
    var i = elements.length;

    var code = String.fromCharCode.apply(null, bufferedCode);
    var __f = new Function(arg, code);

    for ( ; i--; ){
      elements[i] = __f(elements[i]);
    }

    postMessage({
      result: elements
    });
  };
  var blob = new Blob(["onmessage = " + wCode.toString()]);
  var blobURL = window.URL.createObjectURL(blob);

  var w = new Worker(blobURL);

  w.onmessage = function (event) {
    console.log('Resultado:');
    console.log(event.data.result);
  };

  return w;
})();
