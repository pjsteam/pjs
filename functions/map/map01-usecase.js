/**
  pjs.map interface example.
*/

// Define
var pjs = {
  map: function(array, mapper, callback) {
    callback(array.map(mapper));
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

// Start profiling
var startDate = new Date();

// Perform
pjs.map(persons, processPerson, callback);

// End profiling
var ms = new Date() - startDate;
console.log('Overall time: ' + ms + ' ms');
