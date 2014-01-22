var Activity        = require('../lib/Activity.js');
var ActivityManager = require('../lib/ActivityManager.js');
var test            = require('tape');

test('Bundle passed', function(t) {
  t.plan(3);

  var BUNDLE = {};

  var m = new ActivityManager();

  function A()
  {
    this.onCreate = function(bundle) {
      t.strictEqual(bundle, BUNDLE);
    }
    this.onStart = function() { t.strictEqual(arguments.length, 0); }
    this.onResume = function() { t.strictEqual(arguments.length, 0); }
  }

  m.start(A, null, BUNDLE);

});

test('New intent fired', function(t) {
  t.plan(5);

  var BUNDLE = {};

  var m = new ActivityManager();

  var create = 0;
  var intent = 0;
  function A()
  {
    this.onCreate = function(bundle) {
      t.strictEqual(bundle, BUNDLE);
      create++;
    }

    this.onNewIntent = function(bundle) {
      t.strictEqual(bundle, BUNDLE);
      intent++;
    }
  }

  m.start(A, Activity.modes.SINGLE_INSTANCE, BUNDLE);
  m.start(A, null, BUNDLE);
  m.start(A, null, BUNDLE);

  t.strictEqual(create, 1);
  t.strictEqual(intent, 2);

});
