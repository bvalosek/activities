var test            = require('tape');
var ActivityManager = require('../lib/ActivityManager.js');
var Activity        = require('../lib/Activity.js');


test('States interally', function(t) {
  t.plan(7);

  var m = new ActivityManager();
  var nav = m.navigator;

  function A() {
    this.onCreate = function() {
      t.strictEqual(nav.getLastState(this), Activity.states.CREATE);
    };
    this.onStart = function() {
      t.strictEqual(nav.getLastState(this), Activity.states.START);
    };
    this.onResume = function() {
      t.strictEqual(nav.getLastState(this), Activity.states.RESUME);
    };
    this.onPause = function() {
      t.strictEqual(nav.getLastState(this), Activity.states.PAUSE);
    };
    this.onStop = function() {
      t.strictEqual(nav.getLastState(this), Activity.states.STOP);
    };
    this.onDestroy = function() {
      t.strictEqual(nav.getLastState(this), Activity.states.DESTROY);
    };
  }

  // lol
  t.strictEqual(nav.getLastState(nav.finish(nav.start(A))), null);


});
