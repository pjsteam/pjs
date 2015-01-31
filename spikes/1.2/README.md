1.2 - Investigación Typed Arrays - Como funcionan los Transferable Objects
----------------------------

Here you can find transferrableVsCloning.js which compares the use of transferrable objects against object cloning when you send elements throw Web Worker's postMessage function.

*Tests:*
* [Sending small amount of elements](http://jsperf.com/transferrable-vs-cloning)
* [Sending a larger amount of elements](http://jsperf.com/long-transferrable-vs-cloning)

*Results:*

We find out that Transfering objects is faster than cloning them and the difference between them increases proportionally to ArrayBuffer's size.
Also, the tests show that ArrayBuffer's size does not hit Transferable Objects performance.

*Notes:*

The same code is used by both test with one diference:
* [Sending small amount of elements](http://jsperf.com/transferrable-vs-cloning)'s **createElements** function generates an ArrayBuffer with 100000 elements.
* [Sending a larger amount of elements](http://jsperf.com/transferrable-vs-cloning)'s **createElements** function generates an ArrayBuffer with 786432 elements (almost 8 times the first one).

We had to create 2 ArrayBuffers to test the Transferable Objects because we encounter that transferring repeatedly the same ArrayBuffer throws:
```
Failed to execute 'postMessage' on 'Worker': An ArrayBuffer is neutered and could not be cloned.
```
The use of 2 ArrayBuffers gives the time to the other buffer to complete the transferration and then it was available to be use on the next test iteration.
