var total = 80000000;
var typed = new Uint32Array(total);
var parts = navigator.hardwareConcurrency || 4;

for (var i = total; i > 0; i--){
  typed[i - 1] = i;
}

var wCode2 = function(e){
    var result = new Uint32Array(typed.length);
    for (var i = typed.length; i > 0; i--){
      result[i - 1] = Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000)
      + Math.floor(Math.random() * 10000);
    }

    return result;
  }

setTimeout(function(){
  console.time('worker time');
  var elements = wCode2();
  console.timeEnd('worker time');
}, 1000);


var wCode = function(event){
  console.log(event);
  var startDate = new Date();

  var buffer = event.data;

  var elements = new Uint32Array(buffer);

  var result = new Uint32Array(elements.length);
  for (var i = elements.length; i > 0; i--){
    result[i - 1] = Math.floor(Math.random() * 10000)
    + Math.floor(Math.random() * 10000)
    + Math.floor(Math.random() * 10000)
    + Math.floor(Math.random() * 10000);
  }

  var end = new Date();

  postMessage(result.buffer, [result.buffer]);

  postMessage({ start: startDate, end: end });
}

var blob = new Blob([
    "onmessage = " + wCode.toString()]);

// Obtain a blob URL reference to our worker 'file'.
var blobURL = window.URL.createObjectURL(blob);

var workers = [];
var done = 0;
var doneTimes = 0;

var composed = [];

var times = [];
var results = [];

for (var i = parts - 1; i >= 0; i--) {
  var worker = new Worker(blobURL);
  workers.push(worker);
}

setTimeout(function(){
  var startDate = new Date();
  console.time('worker time');
  var factor = (total / parts);
  var bytesPerElement = typed.BYTES_PER_ELEMENT;
  workers.forEach(function(w, index){
    w.onmessage = function(event){
      if (event.data.start){
        doneTimes++;
        times.push(event.data);
        if (doneTimes === parts){
          times.forEach(function(t){
            console.log('worker start ' + t.start.toString() + '.' + t.start.getMilliseconds());
            console.log('worker end  ' + t.end.toString() + '.' + t.end.getMilliseconds());
          });
        }
        return;
      }
      // results.push(event.data);

      if (++done === parts){
        console.timeEnd('worker time');
        var endDate = new Date();
        console.log('overall start ' + startDate.toString() + '.' + startDate.getMilliseconds());
        console.log('overall end ' + endDate.toString() + '.' + endDate.getMilliseconds());
        console.log(endDate - startDate);
        // results.forEach(function(p){
        //   console.log(new Uint32Array(p));
        // });
      }
    };

    var start = index * factor;

    // ideally we would just send parts of the same buffer
    var sliced = typed.buffer.slice(start * bytesPerElement, (start + factor) * bytesPerElement);

    w.postMessage(sliced, [sliced]);
  });
}, 10000);
