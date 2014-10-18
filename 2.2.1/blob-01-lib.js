var ww = (function () {
  var wCode = function (event) {
    var elements = event.data.elements;
    var blobURL = event.data.blobURL;
    var i = elements.length;

    importScripts(blobURL);

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
    var result = event.data.result;

    var p = document.createElement('p');
    p.textContent = 'Resultado: [' + result + ']';
    document.getElementById("resultsDiv").appendChild(p);

    console.log('Resultado:');
    console.log(result);
  };

  return w;
})();
