var Activity = require('./Activity.js');

module.exports = Navigator;

/**
 * Facade that we can use to interact with the activity manager, e.g. from an
 * activity. Provides concise interface to more complex manager.
 * @constructor
 */
function Navigator(manager)
{
  this._manager = manager;
}

/**
 * Create (or give focus to) an activity of type T
 * @param {Function} TActivity
 * @param {Activity.launchModes=} mode
 * @return {Activity}
 */
Navigator.prototype.start = function(TActivity, mode)
{
  return this._manager.start(TActivity, mode);
};

/**
 * Close and finish an activity. Will bring into action the next activity on
 * the stack.
 * @param {Activity} activity
 */
Navigator.prototype.finish = function(activity)
{
  return this._manager.finish(activity);
};

/**
 * Get the last lifecycle state that this activity has executed.
 * @return {Activity.states}
 */
Navigator.prototype.getLastState = function(activity)
{
  return this._manager.getState(activity);
};


