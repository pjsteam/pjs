2.2.1 Investigación - Pruebas de concepto serialización de código
---------------

At this directory you can find:
* tets-howToSendCode
* tets-howToSendCodeWithData
* tets-syncEncodingAPI
* tets-functionSerialization

**tets-functionSerialization:**
-------------

Verifies if it is posible to send a ECMAScript's Function throw WebWorker.postMessage method.

*Test:* [Sending Function throw postMessage](./tets-functionSerialization/test.js)

*Result:*
As you can see on this [image](./tets-functionSerialization/results.png), we find out that it is not possible to send a Function object.
The following error was thrown:
```
DOMException: Failed to execute 'postMessage' on 'Worker': An object could not be cloned.
```

**test-howToSendCode:**
-------------

Verifies the best alternative to send executable code to a web worker. Here you can find the comparison between:
* Use of blobs to generate web workers importing files throw importScript method.
* Use of postMessage to send raw func.toString().
* Use of ArrayBuffers to send encoded func.toString().

*Tests:*
* [Sending short functions to WW](http://jsperf.com/pjs-serialization/3)
* [Sending large functions to WW](http://jsperf.com/pjs-serialization-long/2)

*Results:*

We run the tests both on Chrome 40.X and Chrome 41.X. Each one thrown the same results:
* Use of blobs had the worst performance for both long and short functions.
* Use of default transference of ECMAScript's String throw postMessage is more performant than transferring (as transferrable object) the encoded String with TextEncoder-TextDecoder API.

Here you can see the results for [short functions](./test-howToSendCode/short/results.png) and [long functions](./test-howToSendCode/long/results.png).

**test-howToSendCodeWithData:**
-------------

Verifies which is the best way to send executable code with the data it will have to process at the WW.

Prueba que verifica cual es la formas más conveniente para enviar el código ejecutable junto a los datos a procesar a un web worker. Here you can find the comparison between:
* Use of postMessage to send raw func.toString().
* Use of ArrayBuffers to send encoded func.toString().
Data elements are always sent by Transferrable Objects.

*Test:* [Sending code with elements](http://jsperf.com/pjs-encoding/2)

*Results:*

This test confirmed that it is not convenient the use of TextEncoder-TextDecoder API to send code throw postMessage, as you can see on this  [image](./test-howToSendCodeWithData/results.png).

**test-syncEncodingAPI:**
-------------

Verifies if there is an alternative to the TextEncoder-TextDecoder API. The objective of this test is to prove if the lower TextEncoder-TextDecoder API's performance was not due to the presence of WW.

*Test:* [alternatives to TextEncoder-TextDecoder](http://jsperf.com/pjs-serialization-comparison/4)

*Results:*

We run the tests both on Chrome 40.X and Chrome 41.X. Each one thrown the same result: the API is faster on both Chrome versions, as you can se on this [image](./test-syncEncodingAPI/results.png).
This means we should not try to optimize the func.toString() encoding.

*Verification:*
We use [IRHydra](http://mrale.ph/irhydra/2/) to verify the correctness of our test. This tool give us access to the V8's intermediate resources of our code.

It was needed the following line on our test's configuration:
```
<script src="http://mrale.ph/irhydra/jsperf-renamer.js"></script>
```

We had to run the test with the following command on Terminal (Chrome should be closed as pre-cond):
```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
--no-sandbox \
--js-flags="--trace-hydrogen \
--trace-phase=Z \
--trace-deopt \
--code-comments \
--hydrogen-track-positions \
--redirect-code-traces" \
http://jsperf.com/pjs-serialization-comparison/4
```
