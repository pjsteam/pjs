"use strict";

(function () {
    var pjs = require('p-j-s');
    pjs.init();
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

        pjs(new Uint32Array(canvasData.data.buffer)).map(function(pixel){
            function noise() {
                return Math.random() * 0.5 + 0.5;
            };

            function clamp(component) {
                return Math.max(Math.min(255, component), 0);
            }

            function colorDistance(scale, dest, src) {
                return clamp(scale * dest + (1 - scale) * src);
            };

            var r = pixel & 0xFF;
            var g = (pixel & 0xFF00) >> 8;
            var b = (pixel & 0xFF0000) >> 16;

            var new_r = colorDistance(noise(), (r * 0.393) + (g * 0.769) + (b * 0.189), r);
            var new_g = colorDistance(noise(), (r * 0.349) + (g * 0.686) + (b * 0.168), g);
            var new_b = colorDistance(noise(), (r * 0.272) + (g * 0.534) + (b * 0.131), b);

            return (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
        }, function(result){
            canvasData.data.set(new Uint8ClampedArray(result.buffer));
            tempContext.putImageData(canvasData, 0, 0);
            var diff = new Date() - start;
            log.innerHTML = "Process done in " + diff + " ms";
        });
    };

    source.src = "pic.jpg";
})();
