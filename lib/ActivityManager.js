var _        = require('underscore');
var Activity = require('./Activity.js');

module.exports = ActivityManager;

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
}

/**
 * @param {Activity} activity
 * @param {Activity.states} state
 */
function Frame(activity, state)
{
  this.activity = activity;
  this.state = state || Activity.states.NEW;
}

/**
 * Create (or give focus to) an activity of type T
 * @param {Function} T
 */
ActivityManager.prototype.start = function(T)
{
  // TODO: some logic that sees if this T is registered to re-use top or
  // similar state modes.

  var activity = this._factory(T);

  // Pause previous?
  var top = this._topFrame();
  if (top)
    this._changeState(top, Activity.states.PAUSE);

  var frame = new Frame(activity);
  this._stack.push(frame);
  this._changeState(frame, Activity.states.RESUME);

};

/**
 * Close and finish an activity. Will bring into action the next activity on
 * the stack.
 */
ActivityManager.prototype.finish = function(activity)
{

};

/**
 * @return {Frame} Top of the stack.
 */
ActivityManager.prototype._topFrame = function()
{
  var stack = this._stack;
  if (!stack.length) return null;
  return stack[stack.length - 1];
};

/**
 * Move back one activity in the stack, if possible. Will finish the top
 * activity.
 */
ActivityManager.prototype.back = function()
{

};

/**
 * Move forward one activity in the stack, if possible.
 */
ActivityManager.prototype.forward = function()
{

};

/**
 * Advance the state of an activity.
 * @private
 * @param {Frame} frame
 * @param {Activity.states} state
 */
ActivityManager.prototype._changeState = function(frame, state)
{
  if (!frame)
    throw new Error('Attempted change state of activity not in stack');

  var valids = sm[frame.state];
  var next = valids[0];
  var validStateChange = !!~_(valids).indexOf(state);

  if (validStateChange) {
    transitionState(frame, state);
    return;
  }

  else if (next) {
    transitionState(frame, next);
    this._changeState(frame, state);
  } else {
    throw new Error('Invalid state change');
  }

};

function transitionState(frame, state)
{
  var activity = frame.activity;
  if (activity && activity[state] instanceof Function)
    activity[state]();
  frame.state = state;
}

// State machine of advancing through lifecycle states. Each entry represents
// valid next states, with the first one being the "advancement" choice that is
// the sequence from start to finish
var sm = { };
var states = Activity.states;
sm[states.NEW]     = [states.CREATE];
sm[states.CREATE]  = [states.START];
sm[states.START]   = [states.RESUME];
sm[states.RESUME]  = [states.PAUSE];
sm[states.PAUSE]   = [states.STOP, states.RESUME];
sm[states.STOP]    = [states.DESTROY];
sm[states.DESTROY] = [];
