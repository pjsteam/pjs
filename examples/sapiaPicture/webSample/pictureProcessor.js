importScripts("tools.js");

self.onmessage = function (e) {
    var canvasData = e.data.data;
    var binaryData = canvasData.data;
    
    var l = e.data.length;
    var index = e.data.index;

    processSepia(binaryData, l);

    self.postMessage({ result: canvasData, index: index });
};
