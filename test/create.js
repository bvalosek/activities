var ActivityManager = require('../lib/ActivityManager.js');
var test = require('tape');

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
