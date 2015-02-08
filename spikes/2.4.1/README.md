2.4.1 - Investigar alternativas para consolidar los resultados
-----------------------

@todo (mati)


borrador:

Alternativa A:

  var a = new Int8Array( [ 1, 2, 3 ] );
  var b = new Int8Array( [ 4, 5, 6 ] );

  var c = new Int8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);

  console.log(a);
  console.log(b);
  console.log(c);



Alternativa B:

  DataView:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView

Alternativa C:
  