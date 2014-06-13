module.exports = ActivityManager;

var _         = require('underscore');
var debug     = require('debug')('activities:ActivityManager');
var Activity  = require('./Activity.js');
var Navigator = require('./Navigator.js');
var getName   = require('typedef').getName;

/**
 * Handle our stack of activity with an optional factory function to create new
 * activities for us.
 * @constructor
 * @param {function(T:Function): object} factory Custom factory
 */
function ActivityManager(factory)
{
  /**
   * @type {array.<Activity>}
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
  this.id       = nextFrameId++;
  this.activity = activity;
  this.state    = state || Activity.states.NEW;
  this.mode     = mode || Activity.modes.STANDARD;
}

var nextFrameId = 0;

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
 * @param {Activity.modes=} mode
 * @param {object=} bundle Optional data
 */
ActivityManager.prototype.start = function(T, mode, bundle)
{
  mode = mode || this._getExistingMode(T) || Activity.modes.STANDARD;

  var stack = this._stack;

  var clearTop = !!(mode & Activity.modes.FLAG_CLEAR_TOP);

  debug('attempting to start activity %s', getName(T));

  // Determine exactly how we are going to launch this activy based on the core
  // (non-flagged) mode
  var frame;
  var newActivity = false;
  switch (mode & Activity.modes.FLAG_MASK) {
    case Activity.modes.SINGLE_TOP:
      debug('launching SINGLE_TOP');
      break;

    // Find ANY instance in the stack, re-use it
    case Activity.modes.SINGLE_INSTANCE:
      debug('launching SINGLE_INSTANCE');
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
      debug('launching STANDARD');
      frame = new Frame(T, this._factory(T), mode);
      newActivity = true;
      break;
  }

  // Pause previous if it's not this frame
  var top = this._topFrame();
  if (top && top !== frame) {
    this._changeState(top, Activity.states.PAUSE);
  }

  if (top !== frame)
    stack.push(frame);

  if (newActivity) {
    this._changeState(frame, Activity.states.CREATE, bundle);
  } else if (bundle && frame.activity.onNewIntent instanceof Function) {
    frame.activity.onNewIntent(bundle);
  }

  // If we've made it
  if (frame.state !== Activity.states.DESTROY)
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
 * @return {array.<Frame>}
 */
ActivityManager.prototype.getFrames = function()
{
  return this._stack;
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
 * @param {Frame} frame
 * @private
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
 * @private
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
 * @param {Activity} activity
 * @return {Frame}
 * @private
 */
ActivityManager.prototype._getFrame = function(activity)
{
  return _(this._stack).findWhere({ activity: activity });
};

/**
 * @return {Frame} Top of the stack.
 * @private
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
 * @param {Frame} frame
 * @param {Activity.states} state
 * @param {object=} option
 * @private
 */
ActivityManager.prototype._changeState = function(frame, state, option)
{
  if (!frame)
    throw new Error('Attempted change state of activity not in stack');

  if (frame.state === state) return;

  debug('changing state of %s:%s to %s', getName(frame.T), frame.id, state);

  var valids = sm[frame.state];
  var next = valids[0];
  var validStateChange = !!~_(valids).indexOf(state);

  if (validStateChange) {
    return transitionState(frame, state, option);
  }

  // If there's not a valid state change, but we have some next state that may
  // lead to somewhere, try that state change and see what happens
  else if (next) {
    transitionState(frame, next);
    if (frame.state !== next)
      return;
    this._changeState(frame, state, option);
  } else {
    throw new Error('Invalid state change: ' + state);
  }
};

/**
 * @param {Frame} frame
 * @param {Activity.states} state
 * @param {object} option
 */
function transitionState(frame, state, option)
{
  var activity = frame.activity;
  frame.state = state;

  if (activity && activity[state] instanceof Function) {

    // Only pass in data if we're given some
    if (option !== undefined)
      activity[state](option);
    else
      activity[state]();

    // In the case we have defined onDestroy but do NOt have a parameter, then
    // auto-finish as well
    if (state === Activity.states.DESTROY && activity[state].length === 0)
      option();

  // Ensure we finish an activity if it doesnt want to...
  } else if (state === Activity.states.DESTROY) {
    option();
  }
}

