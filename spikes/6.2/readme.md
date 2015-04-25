# js pref benchmarks

Here you can find:
* Inlined function vs global context's inlined function
* Not inlined functions vs global context's not inlined function
> * Sending additional elements on local context
> * Adding additional elements on global context
* Inlined function vs global context's not-inlined function with adding additional elements on global context

## Inlined function vs global context's inlined function

This test can be found at: ./inlinedVsGlobalInlined

This benchmark tests pjs' map with a function sent each time it is called vs a function sent to global context on pjs' initialization.

```
pjs(...).map(mapper).seq(...);
```
vs
```
pjs.updateContext({
    mapper: mapper
});
...
pjs(...).map('mapper').seq(...);
```

## Not inlined functions vs global context's not inlined function

### Sending additional elements on local context

This test can be found at: ./noInlinedVsGlobalNotInlinedWithContext

This benchmark tests pjs' map with a not inlined function sent each time it is called vs a function sent to global context on pjs' initialization. Both times a context is added to each pjs' map call.

```
var ctx = {
  func1: function () {...},
  func2: function () {...},
  obj1: {...},
  obj2: {...}
};
pjs(...).map(mapper, ctx).seq(...);
```
vs
```
pjs.updateContext({
    mapper: mapper
});
...
var ctx = {
  func1: function () {...},
  func2: function () {...},
  obj1: {...},
  obj2: {...}
};
pjs(...).map('mapper', ctx).seq(...);
```

### Adding additional elements on global context

This test can be found at: ./noInlinedVsGlobalWithGlobalContext

This benchmark tests pjs' map with a not inlined function sent each time it is called vs a function sent to global context on pjs' initialization. Both times a context is added to global context.

```
pjs.updateContext({
  func1: function () {...},
  func2: function () {...},
  obj1: {...},
  obj2: {...}
});
pjs(...).map(mapper).seq(...);
```
vs
```
pjs.updateContext({
  mapper: mapper,
  func1: function () {...},
  func2: function () {...},
  obj1: {...},
  obj2: {...}
});
...
pjs(...).map('mapper').seq(...);
```

## Inlined function vs global context's not-inlined function with adding additional elements on global context

This test can be found at: ./noInlinedVsGlobalNotInlinedWithContext

This benchmark tests pjs' map with an inlined function sent each time it is called vs a function sent to global context on pjs' initialization with additional elements added to global context.

```
pjs(...).map(mapper).seq(...);
```
vs
```
pjs.updateContext({
  mapper: mapper,
  func1: function () {...},
  func2: function () {...},
  obj1: {...},
  obj2: {...}
});
...
pjs(...).map('mapper').seq(...);
```
