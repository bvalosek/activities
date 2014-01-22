module.exports = Activity;

/**
 * Lifecycle interface for an activity. Subclassing or using this class
 * directly isn't necesary.
 * @constructor
 */
function Activity() { }

/**
 * Lifecycle states.
 * @enum
 */
Activity.states = {
  NEW     : 'onInit',
  CREATE  : 'onCreate',
  START   : 'onStart',
  RESUME  : 'onResume',
  BLUR    : 'onBlur',
  FOCUS   : 'onFocus',
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
 * @param {Object=} bundle Any startup options passed to this activity.
 */
Activity.prototype.onCreate = function(bundle) { };

/**
 * Activity has started.
 */
Activity.prototype.onStart = function() { };

/**
 * Activity has come back from a paused or freshly-started state.
 */
Activity.prototype.onResume = function() { };

/**
 * Activity loses focus but is not paused.
 */
Activity.prototype.onBlur = function() { };

/**
 * Activity is coming back from a blur state
 */
Activity.prototype.onFocus = function() { };

/**
 * An activity was attempted to start but instead the action was routed to this
 * activity. Called before other lifecycle events.
 * @param {Object=} Data passed via start() function
 */
Activity.prototype.onNewIntent = function(bundle) { };

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
 * @param {Function} finish Function that should be called when we're done
 */
Activity.prototype.onDestroy = function(finish) { };

