// http://jsperf.com/pjs-encoding
// sending code by copy

var data = {
  elements: generateElements(),
  code: fStringified
};
copyWorker.postMessage(data, [data.elements.buffer]);