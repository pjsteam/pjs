"use strict";

var run;

(function () {

    var source = document.getElementById("source");
    var runButton = document.getElementById("runButton");
    
    run = function () {
        console.time('serial-total');
        console.time('serial-data-init');
        var start = new Date();
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
        console.timeEnd('serial-data-init');
        console.time('serial');
        processSepia(binaryData, len);
        console.timeEnd('serial');
        tempContext.putImageData(canvasData, 0, 0);
        var diff = new Date() - start;
        log.innerHTML = "Process done in " + diff + " ms (no web workers)";
        runButton.style.visibility = "visible"; 
        console.timeEnd('serial-total');
    };

    source.src = "pic.jpg";
})();
