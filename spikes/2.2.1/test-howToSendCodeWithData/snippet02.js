// http://jsperf.com/pjs-encoding
// sending code by transferrable objects

var data = {
  elements: generateElements2(),
  code: encoder.encode(fStringified)
};
transferrableWorker.postMessage(data, [data.code.buffer, data.elements.buffer]);