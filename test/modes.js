var Activity        = require('../lib/Activity.js');
var ActivityManager = require('../lib/ActivityManager.js');
var test            = require('tape');

test('Stanard mode', function(t) {
  t.plan(5);

  var m = new ActivityManager();

  function A() { }
  function B() { }
  function C() { }

  var a1 = m.start(A);
  var a2 = m.start(B);
  var a3 = m.start(C);
  var a4 = m.start(B);

  t.strictEqual(m.getState(a1), Activity.states.PAUSE);
  t.strictEqual(m.getState(a2), Activity.states.PAUSE);
  t.strictEqual(m.getState(a3), Activity.states.PAUSE);
  t.strictEqual(m.getState(a4), Activity.states.RESUME);
  t.strictEqual(m.count(), 4);

});

test('SINGLE_INSTANCE mode', function(t) {
  t.plan(5);

  var m = new ActivityManager();

  function A() { }
  function B() { }
  function C() { }

  var a1 = m.start(A);
  var a2 = m.start(B);
  var a3 = m.start(C);
  var a4 = m.start(B, Activity.modes.SINGLE_INSTANCE);

  t.strictEqual(a2, a4);

  t.strictEqual(m.getState(a1), Activity.states.PAUSE);
  t.strictEqual(m.getState(a3), Activity.states.PAUSE);
  t.strictEqual(m.getState(a4), Activity.states.RESUME);
  t.strictEqual(m.count(), 3);

});

test('SINGLE_INSTANCE mode (more)', function(t) {
  t.plan(5);

  var m = new ActivityManager();

  var id = 0;
  function A() {
    this.id = id++;
    this.x = 0;
    this.onResume = function() {
      t.strictEqual(this.x++, 0, 'only called once');
    }
  }

  var a1 = m.start(A);
  var a2 = m.start(A, Activity.modes.SINGLE_INSTANCE);
  var a3 = m.start(A, Activity.modes.SINGLE_INSTANCE);
  var a4 = m.start(A, Activity.modes.SINGLE_INSTANCE);

  t.strictEqual(a1, a2);
  t.strictEqual(a1, a3);
  t.strictEqual(a1, a4);
  t.strictEqual(m.count(), 1);

});

test('Standard mode multi', function(t) {
  t.plan(7);

  function A() {
    this.x = 0;
    this.onPause = function() {
      t.strictEqual(--this.x, 0);
    };
    this.onResume = function() {
      t.strictEqual(++this.x, 1);
    }
  }

  var m = new ActivityManager();

  m.start(A); // 1
  m.start(A); // 2
  m.start(A); // 2
  m.start(A); // 2

});

test('Single instance + clear top', function(t) {
  t.plan(3);

  var m = new ActivityManager();

  var id = 0;
  function A() { this.id = id++; this.A = true; }
  function B() { this.id = id++; this.B = true; }
  function C() { this.id = id++; this.C = true;}

  var a1 = m.start(A);
  var a2 = m.start(B);
  var a3 = m.start(C);
  var a4 = m.start(A,
    Activity.modes.SINGLE_INSTANCE | Activity.modes.FLAG_CLEAR_TOP);

  t.strictEqual(a1, a4, 'same');
  t.strictEqual(m.getState(a1), Activity.states.RESUME);
  t.strictEqual(m.count(), 1);

});

test('Single instance + clear top + implicit mode', function(t) {
  t.plan(6);

  var m = new ActivityManager();

  var id = 0;
  function A() {
    this.x = 0;
    this.onPause = function() {
      t.strictEqual(--this.x, 0);
    };
    this.onResume = function() {
      t.strictEqual(++this.x, 1);
    }
  }
  function B() { }
  function C() { }

  var a1 = m.start(A,
    Activity.modes.SINGLE_INSTANCE | Activity.modes.FLAG_CLEAR_TOP);
  var a2 = m.start(B);
  var a3 = m.start(C);
  var a4 = m.start(A);

  t.strictEqual(a1, a4, 'same');
  t.strictEqual(m.getState(a1), Activity.states.RESUME);
  t.strictEqual(m.count(), 1);

});
