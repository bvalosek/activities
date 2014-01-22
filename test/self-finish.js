var ActivityManager = require('../lib/ActivityManager.js');
var test            = require('tape');

test('onCreate', function(t) {
  t.plan(1);

  var m = new ActivityManager();

  function A() {
    this.onCreate = function() { m.finish(this); }
  }

  m.start(A);
  t.strictEqual(m.count(), 0, 'empty');
});

test('onStart', function(t) {
  t.plan(1);

  var m = new ActivityManager();

  function A() {
    this.onStart = function() { m.finish(this); }
  }

  m.start(A);
  t.strictEqual(m.count(), 0, 'empty');
});

test('onResume', function(t) {
  t.plan(1);

  var m = new ActivityManager();

  function A() {
    this.onResume = function() { m.finish(this); }
  }

  m.start(A);
  t.strictEqual(m.count(), 0, 'empty');
});

test('onPause', function(t) {
  t.plan(1);

  var m = new ActivityManager();

  function A() {
    this.onPause = function() { m.finish(this); }
  }

  var a = m.start(A);
  m.finish(a);
  t.strictEqual(m.count(), 0, 'empty');
});

test('onStop', function(t) {
  t.plan(1);

  var m = new ActivityManager();

  function A() {
    this.onStop = function() { m.finish(this); }
  }

  var a = m.start(A);
  m.finish(a);
  t.strictEqual(m.count(), 0, 'empty');
});

test('onDestroy', function(t) {
  t.plan(1);

  var m = new ActivityManager();

  function A() {
    this.onDestroy = function() { m.finish(this); }
  }

  var a = m.start(A);
  t.throws(function() {
    m.finish(a);
  });
});
