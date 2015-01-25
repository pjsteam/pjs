2.2.1 Investigación - Pruebas de concepto serialización de código
---------------

En esta sección podemos encontrar las siguientes pruebas de concepto:

-------------
**test-howToSendCode:**

Prueba que verifica cúal es la forma más conveniente para enviar código ejecutable a los web workers.
Entre las alternativas encontradas se probaron:
* Uso de blobs para generar archivos importables en el WW.
* Uso de postMessage para enviar func.toString().
* Transformación de func.toString() a transferrable object para enviarlo por postMessage.

Pruebas:
* [Enviando funciones cortas al WW](http://jsperf.com/pjs-serialization/2)
* [Enviando funciones largas al WW](http://jsperf.com/pjs-serialization-long)

*Resultado:*

En ambos test, probados en chrome 40.X y 41.X, encontramos que:
* El uso de blobs queda descartado por tener baja performance.
* El uso del TextEncoder-TextDecoder para envio por uso de Transferrable Objects no es conveniente frente al simple copiado de Strings por postMessage.

-------------
**test-howToSendCodeWithData:**

Prueba que verifica cual es la formas más conveniente para enviar el código ejecutable junto a los datos a procesar a un web worker.
Entre las alternativas se probaron las ganadoras del test **howToSendCode**:
* Uso de postMessage para enviar func.toString().
* Transformación de func.toString() a transferrable object para enviarlo por postMessage.
En ambas siempre se envían los elementos por transferencia (Trasnferrable Objects).

*Prueba:* [Enviando código con elementos a procesar](http://jsperf.com/pjs-encoding)

*Resultados:*

Se observa que no es conveniente el uso de la API nativa TextEncoder-TextDecoder para enviar el código ni aun en presencia de la transferencia de los elementos a ser procesados.

-------------
**test-syncEncodingAPI:**

Prueba que verifica si hay mejores alternativas que la API de enconding-decoding. A diferencia de las otras pruebas, esta es una prueba sincrónica. Esto se debe a la eliminación del WW para centrarnos en el encoding.

*Prueba:* [alternativas a la API de codificación](http://jsperf.com/pjs-serialization-comparison/2)

*Resultado:*

Encontramos que la API es mucho mas veloz tanto en Chrome 40.X como en 41.X frente al encodeo manual de los strings.

*Verificación:*
Para la correcta verificación de los resultados de esta prueba se utilizó [IRHydra](http://mrale.ph/irhydra/2/). Con esta herramienta logramos ver las representaciones intermedias del código luego de ser compilados por el motor V8 de chrome.

Para esto se agrego la siguiente línea en la configuración del test:
```
<script src="http://mrale.ph/irhydra/jsperf-renamer.js"></script>
```

Y para su ejecución se corrió este comando por Terminal:
```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
--no-sandbox \
--js-flags="--trace-hydrogen \
--trace-phase=Z \
--trace-deopt \
--code-comments \
--hydrogen-track-positions \
--redirect-code-traces" \
http://jsperf.com/pjs-serialization-comparison/2
```
