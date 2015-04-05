"use strict";

var run;

var processSepia = function (binaryData, l) {
    for (var i = 0; i < l; i += 4) {
        var r = binaryData[i];
        var g = binaryData[i + 1];
        var b = binaryData[i + 2];

        var noise_r = Math.random() * 0.5 + 0.5;
        var noise_g = Math.random() * 0.5 + 0.5;
        var noise_b = Math.random() * 0.5 + 0.5;

        binaryData[i] = Math.max(Math.min(255, noise_r * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noise_r) * r), 0);
        binaryData[i + 1] = Math.max(Math.min(255, noise_g * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noise_g) * g), 0);
        binaryData[i + 2] = Math.max(Math.min(255, noise_b * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noise_b) * b), 0);
    }
};

(function () {

    var source = document.getElementById("source");
    var runButton = document.getElementById("runButton");

    run = function () {
        log.innerHTML = "Processing...";
        runButton.style.visibility = "hidden"; 

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
        console.time('serial');
        var start = new Date();
        processSepia(binaryData, len);
        var diff = new Date() - start;
        console.timeEnd('serial');
        tempContext.putImageData(canvasData, 0, 0);
        log.innerHTML = "Process done in " + diff + " ms (no web workers)";
        runButton.style.visibility = "visible"; 
    };

    source.src = "pic.jpg";
})();
