var total = 1000000;
var typed = new Uint32Array(total);

for (var i = total; i > 0; i--){
  typed[i - 1] = i;
}

var wCode = function(e){
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
  var elements = wCode();
  console.timeEnd('worker time');
}, 1000);
