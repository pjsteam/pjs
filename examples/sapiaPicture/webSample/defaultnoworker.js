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

        var canvasData = tempContext.getImageData(0, 0, canvas.width, canvas.height);
        var binaryData = canvasData.data;
        processSepia(binaryData, len);

        tempContext.putImageData(canvasData, 0, 0);
        var diff = new Date() - start;
        log.innerHTML = "Process done in " + diff + " ms (no web workers)";
    };

    source.src = "mop.jpg";
})();
