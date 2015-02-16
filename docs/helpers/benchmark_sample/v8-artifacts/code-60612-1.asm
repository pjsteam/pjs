--- FUNCTION SOURCE (between) id{0,0} ---
(a, b, c){
    return a <= b && b <= c;
  }

--- END ---
--- FUNCTION SOURCE () id{1,0} ---

  function between(a, b, c){
    return a <= b && b <= c;
  }
  var a = Math.round(Math.random()*100);
  var b = Math.round(Math.random()*100) + a;
  var c = Math.round(Math.random()*100) + b;
  var d;
  //end setup
  //start benchmark
  console.time('between');
  for (var i = 0; i < 1000000; i++){
    d = between(a, b, c);
  }

  console.timeEnd('between');

--- END ---
--- FUNCTION SOURCE (between) id{1,1} ---
(a, b, c){
    return a <= b && b <= c;
  }

--- END ---
INLINE (between) id{1,1} AS 1 AT <0:309>
