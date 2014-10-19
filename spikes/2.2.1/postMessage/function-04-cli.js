var run = (function () {
  var showStart = function (elements) {
    console.log('Elementos a transformar:');
    console.log(elements);
  };

  var str2ab = function (str) {
    var buf = new ArrayBuffer(strLength * 2);
    var bufView = new Uint16Array(buf);

    var strLength = str.length;

    var i = strLength;
    var si = i & 0x7;
    if (0 < si) {
      i -= si;
      for (; si--; ) {
          bufView[i] = str.charCodeAt(i);
      }
    }
    for (; i ; i -= 8) {
      bufView[i] = str.charCodeAt(i);
      bufView[i - 1] = str.charCodeAt(i - 1);
      bufView[i - 2] = str.charCodeAt(i - 2);
      bufView[i - 3] = str.charCodeAt(i - 3);
      bufView[i - 4] = str.charCodeAt(i - 4);
      bufView[i - 5] = str.charCodeAt(i - 5);
      bufView[i - 6] = str.charCodeAt(i - 6);
      bufView[i - 7] = str.charCodeAt(i - 7);
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
