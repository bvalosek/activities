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

test('Activity pause', function(t) {
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
