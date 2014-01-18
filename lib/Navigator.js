module.exports = Navigator;

/**
 * Facade that we can use to interact with the activity manager, e.g. from an
 * activity.
 * @constructor
 */
function Navigator(activities)
{
  this._activities = activities;
}

/**
 * Move back one activity in the stack, if possible. Will finish the top
 * activity.
 */
Navigator.prototype.back = function()
{
  return this._activities.back();
};

/**
 * Move forward one activity in the stack, if possible.
 */
Navigator.prototype.forward = function()
{
  return this._activities.forward();
};

/**
 * Create (or give focus to) an activity of type T
 * @param {Function} TActivity
 */
Navigator.prototype.start = function(TActivity)
{
  return this._activities.start(TActivity);
};

/**
 * Close and finish an activity. Will bring into action the next activity on
 * the stack.
 */
Navigator.prototype.finish = function(activity)
{
  return this._activities.finish(activity);
};


