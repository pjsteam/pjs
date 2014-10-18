var run = (function () {
  var showStart = function (elements) {
    console.log('Elementos a transformar:');
    console.log(elements);
  };

  var str2ab = function (str) {
    var strLength = str.length;
    var buf = new ArrayBuffer(strLength * 2);
    var bufView = new Uint16Array(buf);
    var i = strLength;
    for (; i--; ) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView;
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
    var bufferedBody = str2ab(body);

    showStart(elements);

    ww.postMessage({
      arg: arg,
      code: bufferedBody,
      elements: elements
    }, [bufferedBody.buffer]);
  };
})();
