var run = (function () {
  var runCount = 0;
  return function (ww) {
    var elements = [1, 2, 3, 4];
    var mapper = function (element) {
      i = 0; // siendo 'i' la variable de control del loop. Al ponerla en 0 se intenta detener el procesamiento.
      return element + '!';
    };

    var blob = new Blob(['__f = ' + mapper.toString()], { type: 'application/javascript' });
    var blobURL = window.URL.createObjectURL(blob);

    runCount += 1;
    var div = document.getElementById("resultsDiv");
    while (div.hasChildNodes()) {
      div.removeChild(div.lastChild);
    }
    var p = document.createElement('p');
    p.textContent = 'Run : ' + runCount;
    div.appendChild(p);
    p = document.createElement('p');
    p.textContent = 'Elementos a transformar: ' + elements;
    div.appendChild(p);

    console.log('Elementos a transformar:');
    console.log(elements);
    
    ww.postMessage({
      blobURL: blobURL,
      elements: elements
    });

  };
})();
