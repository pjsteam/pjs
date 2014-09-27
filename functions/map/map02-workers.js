/**
  pjs.map with workers.
  pjs.map @p process function is ignored.
  Only one worker at @p workers is being used.
*/

// Define
var pjs = {
  map: function(array, process, callback) {
    var w = this.workers[0];
    w.onmessage = function(event) {
      var data = event.data;
      var time = data.runTime;
      var result = data.result;
      console.log('Overall time: ' + time + ' ms');
      callback(result);
    };
    w.postMessage({
      start: new Date(),
      elements: array
    });
  },
  workers: ((function (){
    var items = [];
    var parts = navigator.hardwareConcurrency || 2;
    var i = parts;

    var wCode = function (event) {
        var elements = event.data.elements;
        var startTime = event.data.start;
        var result = [];
        var i = elements.length;

        for ( ; i--; ){
          result[i] = elements[i].name + 'WKD';
        }

        postMessage({
          result: result,
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

  // Clean
  pjs.terminate();
}

// Perform
pjs.map(persons, processPerson, callback);
