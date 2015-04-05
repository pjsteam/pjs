"use strict";

var run;

(function() {
  var pjs = require('p-j-s');
  pjs.init({ maxWorkers: 4 });
  pjs.updateContext({
    f:function(pixel){
      // return pixel;
      var r = pixel & 0xFF;
      var g = (pixel & 0xFF00) >> 8;
      var b = (pixel & 0xFF0000) >> 16;
      var noiser = Math.random() * 0.5 + 0.5;
      var noiseg = Math.random() * 0.5 + 0.5;
      var noiseb = Math.random() * 0.5 + 0.5;

      var new_r = Math.max(Math.min(255, noiser * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noiser) * r), 0);
      var new_g = Math.max(Math.min(255, noiseg * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noiseg) * g), 0);
      var new_b = Math.max(Math.min(255, noiseb * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noiseb) * b), 0);

      return (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
    }
  }).then(function(){
    var source = document.getElementById("source");
    var runButton = document.getElementById("runButton");
    run = function(){
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

        tempContext.drawImage(source, 0, 0, canvas.width, canvas.height);

        var canvasData = tempContext.getImageData(0, 0, canvas.width, canvas.height);
        var temp = new SharedUint8ClampedArray(canvasData.data.length);
        temp.set(canvasData.data);
        var copyData = new SharedUint32Array(temp.buffer);
        var start = new Date();
        pjs(copyData).map('f').seq(function(err, result) {
          var diff = new Date() - start;
          canvasData.data.set(new Uint8ClampedArray(result.buffer));
          tempContext.putImageData(canvasData, 0, 0);
          log.innerHTML = "Process done in " + diff + " ms";
          runButton.style.visibility = "visible";
        });
    };

    source.src = "pic.jpg";
  });
})();
