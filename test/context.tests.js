describe('context tests', function(){
  var context = require('../src/context');

  describe('serialize', function(){
    it('should work on object with only one property of type number', function(){
      var serialized = context.serializeFunctions({
        prop: 10
      });

      expect(serialized.prop).to.equal(10);
    });

    it('should work on object with only one property of type array', function(){
      var serialized = context.serializeFunctions({
        prop: [ 1,2,3 ],
      });

      expect(serialized.prop).to.have.length(3);
      expect(serialized.prop[0]).to.equal(1);
      expect(serialized.prop[1]).to.equal(2);
      expect(serialized.prop[2]).to.equal(3);
    });

    it('should work on object with only one property function', function(){
      var serialized = context.serializeFunctions({
        prop: function(a,b,c) { return a + b * c; },
      });

      expect(serialized.prop.__isFunction).to.be.true;
      expect(serialized.prop.code).to.equal(' return a + b * c; ');
      expect(serialized.prop.args).to.have.length(3);
      expect(serialized.prop.args[0]).to.equal('a');
      expect(serialized.prop.args[1]).to.equal('b');
      expect(serialized.prop.args[2]).to.equal('c');
    });

    it('should work on object with many properties', function(){
      var serialized = context.serializeFunctions({
        val: 10,
        items: [ 1,2,3 ],
        f: function(a,b,c) { return a + b * c; },
      });

      expect(serialized.val).to.equal(10);

      expect(serialized.items).to.have.length(3);
      expect(serialized.items[0]).to.equal(1);
      expect(serialized.items[1]).to.equal(2);
      expect(serialized.items[2]).to.equal(3);

      expect(serialized.f.__isFunction).to.be.true;
      expect(serialized.f.code).to.equal(' return a + b * c; ');
      expect(serialized.f.args).to.have.length(3);
      expect(serialized.f.args[0]).to.equal('a');
      expect(serialized.f.args[1]).to.equal('b');
      expect(serialized.f.args[2]).to.equal('c');
    });

    it ('should work with nested properties', function(){
      var serialized = context.serializeFunctions({
        l1: {
          items: [ 1, 2, 3]
        },
        val: 10
      });

      expect(serialized.val).to.equal(10);

      expect(serialized.l1.items).to.have.length(3);
      expect(serialized.l1.items[0]).to.equal(1);
      expect(serialized.l1.items[1]).to.equal(2);
      expect(serialized.l1.items[2]).to.equal(3);
    });

    it('should work with nested functions', function(){
      var serialized = context.serializeFunctions({
        l1: {
          l2: {
            h: function(a,b) { return a / b; }
          },
          g: function(a, b) { return a * b; }
        },
        f: function(a, b, c) { return a + b / c; }
      });

      expect(serialized.f.__isFunction).to.be.true;
      expect(serialized.f.code).to.equal(' return a + b / c; ');
      expect(serialized.f.args).to.have.length(3);
      expect(serialized.f.args[0]).to.equal('a');
      expect(serialized.f.args[1]).to.equal('b');
      expect(serialized.f.args[2]).to.equal('c');

      expect(serialized.l1.g.__isFunction).to.be.true;
      expect(serialized.l1.g.code).to.equal(' return a * b; ');
      expect(serialized.l1.g.args).to.have.length(2);
      expect(serialized.l1.g.args[0]).to.equal('a');
      expect(serialized.l1.g.args[1]).to.equal('b');

      expect(serialized.l1.l2.h.__isFunction).to.be.true;
      expect(serialized.l1.l2.h.code).to.equal(' return a / b; ');
      expect(serialized.l1.l2.h.args).to.have.length(2);
      expect(serialized.l1.l2.h.args[0]).to.equal('a');
      expect(serialized.l1.l2.h.args[1]).to.equal('b');
    });
  });

  describe('deserialize', function(){
    it('should work on object with only one property number', function(){
      var deserialized = context.deserializeFunctions({
        prop: 10
      });

      expect(deserialized.prop).to.equal(10);
    });

    it('should work on object with only one property of type array', function(){
      var deserialized = context.deserializeFunctions({
        prop: [ 1,2,3 ],
      });

      expect(deserialized.prop).to.have.length(3);
      expect(deserialized.prop[0]).to.equal(1);
      expect(deserialized.prop[1]).to.equal(2);
      expect(deserialized.prop[2]).to.equal(3);
    });

    it('should work on object with only one property function', function(){
      var deserialized = context.deserializeFunctions({
        f: {
          __isFunction: true,
          args: [ 'a', 'b', 'c' ],
          code: ' return a + b * c'
        }
      });

      expect(deserialized.f(1,2,3), 7);
    });

    it('should work on object with many properties', function(){
      var deserialized = context.deserializeFunctions({
        val: 10,
        items: [ 1,2,3 ],
        f: {
          __isFunction: true,
          args: [ 'a', 'b', 'c' ],
          code: ' return a + b * c'
        }
      });

      expect(deserialized.val).to.equal(10);

      expect(deserialized.items).to.have.length(3);
      expect(deserialized.items[0]).to.equal(1);
      expect(deserialized.items[1]).to.equal(2);
      expect(deserialized.items[2]).to.equal(3);

      expect(deserialized.f(1,2,3), 7);
    });

    it ('should work with nested properties', function(){
      var deserialized = context.deserializeFunctions({
        l1: {
          items: [ 1, 2, 3]
        },
        val: 10
      });

      expect(deserialized.val).to.equal(10);

      expect(deserialized.l1.items).to.have.length(3);
      expect(deserialized.l1.items[0]).to.equal(1);
      expect(deserialized.l1.items[1]).to.equal(2);
      expect(deserialized.l1.items[2]).to.equal(3);
    });

    it('should work with nested functions', function(){
      var deserialized = context.deserializeFunctions({
        l1: {
          l2: {
            h: {
              __isFunction: true,
              args: [ 'a', 'b' ],
              code: ' return a / b'
            }
          },
          g: {
            __isFunction: true,
            args: [ 'a', 'b' ],
            code: ' return a * b'
          }
        },
        f: {
          __isFunction: true,
          args: [ 'a', 'b', 'c' ],
          code: ' return a + b / c'
        }
      });

      expect(deserialized.f(8, 4, 2)).to.equal(10);
      expect(deserialized.l1.g(3, 7)).to.equal(21);
      expect(deserialized.l1.l2.h(1, 4)).to.equal(0.25);
    });
  });
});