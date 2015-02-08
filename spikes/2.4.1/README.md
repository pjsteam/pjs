2.4.1 - Investigar alternativas para consolidar los resultados
-----------------------

**merge.js**
-----------------------

Verifies which is the best way to merge multiple TypedArrays into an unique Typed Array containing every element in order and without holes.
The following alternatives were tested:
* Non-native function: it creates a TypedArray with the total count of elements and the we iterate all the arrays to copy them into the target.
* TypedArray set function: it creates a TypedArray with the total count of elements and then inserts all the parts typed arrays using [TypedArray's set function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set)
* DataView set function: it creates a TypedArray with the total count of elements and the we iterate all the arrays to copy them into the target using [DataView's set function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) for 8 bit element.
* Array like function: it creates a native Array object with the total count of elements and the we iterate all the arrays to copy them into the target. Finally this array is used to creare the final ArrayBuffer.

*Test:* [Typed Arrays Merge](http://jsperf.com/typedarray-merge)

*Result:*
We run the tests both on Chrome 40.X and Chrome 41.X. Each one thrown the same result: TypedArray's set function is the best choice of all. No other test case is up to it. That is why we will use it as our TypedArray merging method.

Here you can see the results for [merging TypedArrays](./merge.png)
