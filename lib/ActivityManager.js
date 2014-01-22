module.exports = ActivityManager;

var _         = require('underscore');
var Activity  = require('./Activity.js');
var Navigator = require('./Navigator.js');

/**
 * @constructor
 * @param {Function(T:Function): Object} factory Custom factory
 */
function ActivityManager(factory)
{
  /**
   * @type {Array.<Activity>}
   */
  this._stack    = [];
  this._factory = factory || function(T) { return new T(); };

  this.navigator = new Navigator(this);
}

/**
 * @constructor
 * @param {Activity} activity
 * @param {Activity.states=} state
 * @param {Activity.modes=} param
 * @private
 */
function Frame(T, activity, mode, state)
{
  this.T        = T;
  this.activity = activity;
  this.state    = state || Activity.states.NEW;
  this.mode     = mode || Activity.modes.STANDARD;
}

// State machine of advancing through lifecycle states. Each entry represents
// valid next states, with the first one being the "advancement" choice that is
// the sequence from start to finish
var sm             = { };
var states         = Activity.states;
sm[states.NEW]     = [states.CREATE];
sm[states.CREATE]  = [states.START];
sm[states.START]   = [states.RESUME];
sm[states.RESUME]  = [states.PAUSE];
sm[states.BLUR]    = [states.FOCUS];
sm[states.FOCUS]   = [states.PAUSE, states.BLUR];
sm[states.PAUSE]   = [states.STOP, states.RESUME];
sm[states.STOP]    = [states.DESTROY];
sm[states.DESTROY] = [];

/**
 * Create (or give focus to) an activity of type T
 * @param {Function} T
 * @param {Activity.modes} mode
 */
ActivityManager.prototype.start = function(T, mode)
{
  mode = mode || this._getExistingMode(T) || Activity.modes.STANDARD;

  var stack = this._stack;

  var clearTop = !!(mode & Activity.modes.FLAG_CLEAR_TOP);

  // Determine exactly how we are going to launch this activy based on the core
  // (non-flagged) mode
  var frame;
  switch (mode & Activity.modes.FLAG_MASK) {
  case Activity.modes.SINGLE_TOP:
    break;

  // Find ANY instance in the stack, re-use it
  case Activity.modes.SINGLE_INSTANCE:
    frame = _(stack).find(function(s) {
      return s.activity instanceof T;
    });

    // Pop out from from stack
    if (!clearTop && frame) {
      stack.splice(_(this._stack).indexOf(frame), 1);
      break;

    // Walk down stack and kill as we go
    } else if (clearTop && frame) {
      this._finishAllAbove(frame.activity);
      break;
    }

    // fall through...

  // Only situation where we actually create a new frame
  case Activity.modes.STANDARD:
    frame = new Frame(T, this._factory(T), mode);
    break;
  }

  // Pause previous if it's not this frame
  var top = this._topFrame();
  if (top && top !== frame) {
    this._changeState(top, Activity.states.PAUSE);
  }

  if (top !== frame)
    stack.push(frame);

  this._changeState(frame, Activity.states.RESUME);

  return frame.activity;
};

/**
 * @return {Number} Total number of activities.
 */
ActivityManager.prototype.count = function()
{
  return this._stack.length;
};

/**
 * @param {Activity} activity
 * @return {Activity.states}
 */
ActivityManager.prototype.getState = function(activity)
{
  var frame = this._getFrame(activity);
  if (!frame) return null;
  return frame.state;
};

/**
 * Close and finish an activity. Will bring into action the next activity on
 * the stack.
 * @param {Activity} activity
 */
ActivityManager.prototype.finish = function(activity)
{
  var frame = this._getFrame(activity);

  if (!frame)
    throw new Error('Attempted to finish activity not in stack');

  this._changeState(frame, Activity.states.STOP);

  // Allow async removal of frame
  var _this = this;
  var fin = function() { _this._removeFrame(frame); };
  this._changeState(frame, Activity.states.DESTROY, fin);

  // Focus new one?
  var top = this._topFrame();
  if (!top) return;

  this._changeState(top, Activity.states.RESUME);
};

ActivityManager.prototype._finished = function(frame)
{
  return frame.state !== states.STOP && frame.state !== states.DESTROY;
};

/**
 * @return {Activity.modes}
 */
ActivityManager.prototype._getExistingMode = function(T)
{
  for (var n = this._stack.length - 1; n >= 0; n--) {
    var frame = this._stack[n];
    if (frame.T === T)
      return frame.mode;
  }
};

/**
 * Remove a frame from the stack
 * @private
 * @param {Frame} frame
 */
ActivityManager.prototype._removeFrame = function(frame)
{
  for (var n = 0; n < this._stack.length; n++) {
    var other = this._stack[n];
    if (other !== frame) continue;
    this._stack.splice(n, 1);
    return;
  }
};

/**
 * @param {Activity} activity
 */
ActivityManager.prototype._finishAllAbove = function(activity)
{
  for (var n = this._stack.length - 1; n >= 0; n--) {
    var frame = this._stack[n];
    if (frame.activity === activity)
      break;
    this.finish(frame.activity);
  }
};

/**
 * @private
 * @param {Activity} activity
 * @return {Frame}
 */
ActivityManager.prototype._getFrame = function(activity)
{
  return _(this._stack).findWhere({ activity: activity });
};

/**
 * @private
 * @return {Frame} Top of the stack.
 */
ActivityManager.prototype._topFrame = function()
{
  for (var n = this._stack.length - 1; n >= 0; n--) {
    var frame = this._stack[n];
    if (frame.state !== Activity.states.DESTROY)
      return frame;
  }
};

/**
 * Advance the state of an activity.
 * @private
 * @param {Frame} frame
 * @param {Activity.states} state
 * @param {Object=} option
 */
ActivityManager.prototype._changeState = function(frame, state, option)
{
  if (!frame)
    throw new Error('Attempted change state of activity not in stack');

  if (frame.state === state) return;

  var valids = sm[frame.state];
  var next = valids[0];
  var validStateChange = !!~_(valids).indexOf(state);

  if (validStateChange) {
    return transitionState(frame, state, option);
  }

  else if (next) {
    var res = transitionState(frame, next);
    if (frame.state !== next)
      return res;
    return this._changeState(frame, state);
  } else {
    throw new Error('Invalid state change: ' + state);
  }
};

function transitionState(frame, state, option)
{
  var activity = frame.activity;
  frame.state = state;

  if (activity && activity[state] instanceof Function)
    activity[state](option);

  // Ensure we finish an activity if it doesnt want to...
  else if (state === Activity.states.DESTROY)
    option();
}

