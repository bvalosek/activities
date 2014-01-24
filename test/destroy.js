var ActivityManager = require('../lib/ActivityManager.js');
var test = require('tape');

test('Sync destroy', function(t) {
  t.plan(1);

  var m = new ActivityManager();

  function A()
  {
    this.onDestroy = function(finish) { finish(); };
  }

  m.finish(m.start(A));

  t.strictEqual(m.count(), 0);

});

test('Async destroy + top semantics', function(t) {
  t.plan(4);

  var m = new ActivityManager();
  var f;

  function A()
  {
    this.onDestroy = function(finish) { f = finish; };
  }

  var a1 = m.start(A);
  m.finish(m.start(A));

  t.strictEqual(m.count(), 2);
  t.strictEqual(m._topFrame().activity, a1);
  f();
  t.strictEqual(m.count(), 1);
  t.strictEqual(m._topFrame().activity, a1);
});


test('No params implying manager finishes', function(t) {
  t.plan(3);

  var m = new ActivityManager();

  function A()
  {
    this.onDestroy = function() { t.pass('fired'); };
  }

  var a = m.start(A);
  t.strictEqual(m.count(), 1);
  m.finish(a);
  t.strictEqual(m.count(), 0);

});
