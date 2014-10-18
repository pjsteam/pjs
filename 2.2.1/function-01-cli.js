var run = (function () {
  var runCount = 0;

  var showStart = function (elements) {
    runCount += 1;
    var div = document.getElementById("resultsDiv");
    while (div.hasChildNodes()) {
      div.removeChild(div.lastChild);
    }
    var p = document.createElement('p');
    p.textContent = 'Run : ' + runCount;
    div.appendChild(p);
    p = document.createElement('p');
    p.textContent = 'Elementos a transformar: [' + elements + ']';
    div.appendChild(p);

    console.log('Elementos a transformar:');
    console.log(elements);
  };

  return function (ww) {
    var elements = [1, 2, 3, 4];
    var mapper = function (element) {
      return element + '!';
    };

    var stringMapper = mapper.toString();
    var match = stringMapper.match(/function[^{]+\{([\s\S]*)\}$/);
    var body = match[1];
    var args = /\(([^)]+)/.exec(stringMapper);
    if (args[1]) {
        args = args[1].split(/\s*,\s*/);
    }
    var arg = args[0];

    showStart(elements);

    ww.postMessage({
      arg: arg,
      code: body,
      elements: elements
    });

  };
})();
