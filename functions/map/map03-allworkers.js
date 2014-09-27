/**
  pjs.map with workers.
  pjs.map @p process function is ignored.
  Only one worker at @p workers is being used.
*/

// Define
var pjs = {
  map: function(array, process, callback) {
    var finishCount = 0;
    var wks = this.workers;
    var wIndex = wks.length;
    var factor = Math.floor(array.length / wks.length);
    var wCallback = function(event) {
      var data = event.data;
      var time = data.runTime;
      var overallStart = data.overallStart;
      var result = data.result;
      console.log('Worker time: ' + time + ' ms');
      finishCount++;
      callback(result);
      if (finishCount === wks.length) {
        console.log('Overall time: ' + (new Date() - overallStart) + ' ms');
        pjs.terminate();
      }
    };

    var overallStart = new Date();

    for ( ; wIndex-- ; ) {
      var wTime = new Date();
      var wElements;
      var w = wks[wIndex];
      var aux = 0;
      var wStart = wIndex * factor;
      var wEnd = wStart + factor;
      if (wIndex === (wks.length - 1)) {
        aux = array.length - wEnd;
      }

      wElements = array.slice(wStart, wEnd + aux);

      console.log('(' + wStart + ' , ' + (wEnd + aux) + ')')
      w.onmessage = wCallback;
      w.postMessage({
        start: wTime,
        overallStart: overallStart,
        elements: wElements
      });
    }
  },
  workers: ((function (){
    var items = [];
    var parts = navigator.hardwareConcurrency || 2;
    var i = parts;

    var wCode = function (event) {
        var elements = event.data.elements;
        var startTime = event.data.start;
        var overallStart = event.data.overallStart;
        var result = [];
        var i = elements.length;

        for ( ; i--; ){
          result[i] = elements[i].name + 'WKD';
        }

        postMessage({
          result: result,
          overallStart: overallStart,
          runTime: new Date() - startTime
        });
    };
    var blob = new Blob(["onmessage = " + wCode.toString()]);
    var blobURL = window.URL.createObjectURL(blob);
    for (; i--;) {
      var worker = new Worker(blobURL);
      items.push(worker);
    }
    console.log('#workers created: ' + parts);
    return items;
  })()),
  terminate: function () {
    var i = this.workers.length;
    for ( ; i--; ){
      this.workers[i].terminate();
    }
    this.workers = [];
  }
};

// Prepare
var createPersons = function (count) {
  var items = [];
  var i = count;

  var createPerson = function (pName, pAge) {
    return {
      name: pName,
      age: pAge
    };
  };

  for (; i-- ;) {
    items.push(createPerson('name' + i, Math.floor(Math.random() * 40 + 10)));
  }

  return items;
}

var persons = createPersons(100);

var processPerson = function (person) {
  return person.name;
};

var callback = function (names) {
  console.log(names);
}

// Perform
pjs.map(persons, processPerson, callback);
