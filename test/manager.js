var test            = require('tape');
var ActivityManager = require('../lib/ActivityManager.js');

test('Basic activity start', function(t) {
  t.plan(3);

  var x = 0;

  function A() {
    this.onCreate = function() { t.strictEqual(x++, 0, 'onCreate called'); };
    this.onStart = function() { t.strictEqual(x++, 1, 'onStart called'); };
    this.onResume = function() { t.strictEqual(x++, 2, 'onResume called'); };
  }

  var m = new ActivityManager();
  m.start(A);

});

test('Activity stacking', function(t) {
  t.plan(7);

  var m = new ActivityManager();

  function A() {
    this.x = 0;
    this.onCreate = function() { t.strictEqual(this.x++, 0, 'onCreate called'); };
    this.onStart = function() { t.strictEqual(this.x++, 1, 'onStart called'); };
    this.onResume = function() { t.strictEqual(this.x++, 2, 'onResume called'); };
    this.onPause = function() { t.strictEqual(this.x++, 3, 'onPause called'); };
  }

  m.start(A);
  m.start(A);

});

test('Activity with finish', function(t) {
  t.plan(6);

  var m = new ActivityManager();

  function A() {
    this.x = 0;
    this.onCreate = function() { t.strictEqual(this.x++, 0, 'onCreate called'); };
    this.onStart = function() { t.strictEqual(this.x++, 1, 'onStart called'); };
    this.onResume = function() { t.strictEqual(this.x++, 2, 'onResume called'); };
    this.onPause = function() { t.strictEqual(this.x++, 3, 'onPause called'); };
    this.onStop = function() { t.strictEqual(this.x++, 4, 'onStop called'); };
    this.onDestroy = function(f) { f(); t.strictEqual(this.x++, 5, 'onDestroy called'); };
  }

  var a1 = m.start(A);
  m.finish(a1);

});

test('Activity stacking with finish', function(t) {
  t.plan(11);

  var m = new ActivityManager();

  function A() {
    this.x = 0;
    this.onCreate = function() { t.strictEqual(this.x++, 0, 'onCreate called'); };
    this.onStart = function() { t.strictEqual(this.x++, 1, 'onStart called'); };
    this.onPause = function() { t.strictEqual(this.x++, 2, 'onPause called'); };
    this.onStop = function() { t.strictEqual(this.x++, 3, 'onStop called'); };
    this.onDestroy = function(f) { f(); t.strictEqual(this.x++, 4, 'onDestroy called'); };

    this.onResume = function() {
      t.pass('on resume called');
    };
  }

  m.start(A); // x3
  m.finish(m.start(A)); // x1 + x3 + x3 + x1

});
