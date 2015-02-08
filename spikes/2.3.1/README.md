2.3.1 - Investigar alternativas partición del Typed Array
-----------------------

At this directory you can find:
* copyComparison
* splitComparison

copyComparison
-----------------------

Verifies which is the best alternative to copy one TypedArray to new TypedArray.
The following alternatives were tested:
* Manual: it creates a TypedArray with the total count of elements and then iterates all array's elements to copy them into the target.
* Buffer slice: it creates a JavaScript's Array with ArrayBuffer.prototype.slice function and then uses this array to create a TypedArray.
* Constructor: it creates a TypedArray from the typed array to copy using TypedArray constructor.
* TypedArray set: it creates a TypedArray with the total count of elements and then inserts all the parts typed arrays using [TypedArray's set function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set).
* Buffer subarray: it creates a new TypedArray with [TypedArray's subarray function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray) and then uses the contrcutor to create the new TypedArray.
* Blob: it creates a blob from a TypedArray and then uses a FileReader to obtein the elements and insert them into the target TypedArray.

*Test:* [Typed Array copy comparison](http://jsperf.com/arraybuffer-copy)

*Results:*
We run the tests both on Chrome 40.X and Chrome 41.X. We find out that the best alternatives where:
* Manual
* Buffer slice
* Buffer subarray
* TypedArray set
The diference between them were so low that we decided to use then on the next test.

Here you can see the results for [copying TypedArrays](./copyComparison.png)

splitComparison
-----------------------

Verifies which is the best alternative to split a TypedArray in multiple sub arrays.
The following alternatives were tested:
* @todo

*Test:* [Typed Array split comparison](http://jsperf.com/arraybuffer-split)
