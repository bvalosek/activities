module.exports = Activity;

/**
 * Lifecycle interface for an activity. Subclassing or using this class
 * directly isn't necesary.
 * @constructor
 */
function Activity()
{

}

/**
 * Lifecycle states.
 * @enum
 */
Activity.states = {
  NEW     : 'onInit',
  CREATE  : 'onCreate',
  START   : 'onStart',
  RESUME  : 'onResume',
  PAUSE   : 'onPause',
  STOP    : 'onStop',
  DESTROY : 'onDestroy'
};

/**
 * How the activity is launched.
 * @enum
 */
Activity.modes = {
  STANDARD        : 1,
  SINGLE_TOP      : 2,
  SINGLE_INSTANCE : 3,
  FLAG_MASK       : 1023,
  FLAG_CLEAR_TOP  : 1024 * 1
}

/**
 * Activity has been created.
 */
Activity.prototype.onCreate = function() { };

/**
 * Activity has started.
 */
Activity.prototype.onStart = function() { };

/**
 * Activity has come back from a paused or freshly-started state.
 */
Activity.prototype.onResume = function() { };

/**
 * Activity has been requested to pause.
 */
Activity.prototype.onPause = function() { };

/**
 * Activity has been stopped.
 */
Activity.prototype.onStop = function() { };

/**
 * Activity has been destroyed.
 */
Activity.prototype.onDestroy = function() { };

