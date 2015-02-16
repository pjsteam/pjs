"use strict";

(function () {

    var source = document.getElementById("source");

    source.onload = function () {
        var start = new Date();

        var canvas = document.getElementById("target");
        canvas.width = source.clientWidth;
        canvas.height = source.clientHeight;

        if (!canvas.getContext) {
            log.innerHTML = "Canvas not supported. Please install a HTML5 compatible browser.";
            return;
        }

        var tempContext = canvas.getContext("2d");
        var len = canvas.width * canvas.height * 4;

        tempContext.drawImage(source, 0, 0, canvas.width, canvas.height);

        if (!window.Worker) {

            var canvasData = tempContext.getImageData(0, 0, canvas.width, canvas.height);
            var binaryData = canvasData.data;
            processSepia(binaryData, len);

            tempContext.putImageData(canvasData, 0, 0);
            var diff = new Date() - start;
            log.innerHTML = "Process done in " + diff + " ms (no web workers)";

            return;
        }

        var workersCount = 4;
        var finished = 0;
        var segmentLength = len / workersCount;
        var blockSize = canvas.height / workersCount;

        var onWorkEnded = function (e) {
            var canvasData = e.data.result;
            var index = e.data.index;

            tempContext.putImageData(canvasData, 0, blockSize * index);

            finished++;

            if (finished == workersCount) {
                var diff = new Date() - start;
                log.innerHTML = "Process done in " + diff + " ms";
            }
        };

        for (var index = 0; index < workersCount; index++) {
            var worker = new Worker("pictureProcessor.js");
            worker.onmessage = onWorkEnded;

            var canvasData = tempContext.getImageData(0, blockSize * index, canvas.width, blockSize);
            worker.postMessage({ data: canvasData, index: index, length: segmentLength });
        }
    };

    source.src = "mop.jpg";
})();
