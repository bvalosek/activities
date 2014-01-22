# Activities

[![Build Status](https://travis-ci.org/bvalosek/activities.png?branch=master)](https://travis-ci.org/bvalosek/activities)
[![NPM version](https://badge.fury.io/js/activities.png)](http://badge.fury.io/js/activities)

Traverse the application stack with managed state lifecycle.

[![browser support](https://ci.testling.com/bvalosek/activities.png)](https://ci.testling.com/bvalosek/activities)

## Installation

**Activities** is meant to be used with [Browserify](http://browserify.org/), so
install with npm:

```
npm install activities
```

## Overview

An `Activity` is effectively some discrete chunk of application state. Any
class can be an activity, but implementing one or more of the *Lifecycle
Methods* allows it to react to state changes / transitions in the application.

The `ActivityManager` class maintains an activity stack and handles calling the
lifecycle methods as the stack changes and your applications progresses through
its state graph. It exposes a `Navigator` instance that is a facade to its
basic navigation API of `start(TActivity, mode)` and `finish(activity)`.

The `Navigator` facade is the primary way your application with trigger state
transitions that the `ActivityManager` will handle.

This module is potentially useful in a wide range of uses cases from Single
Page Apps managing difference screens and dialogs, to games maintaning
different scenes and modes.

## Lifecycle Methods

* **onCreate**(`Bundle: Object`) Activity has been intantiated. Do all one-time setup and
  initialization code here.

* **onStart**() Activity has been started. Continue any final initialization or
  one-time boot code here.

* **onResume**() Activity is now ready for interaction with the user. Called
  after `onStart()` or when returning from a paused state.

* **onPause**() Application is about to resume another Activity. Save any state
  or suspend and updating / monitoring here. Always called before `onStop()`.

* **onStop**() Activity is shutting down. Put any shutdown / finishing /
  unbinding behavior here. Called only once.

* **onDestroy**(`finish: Function`) Called right before the activity is removed
  from the stack. If an Activity implements this function, the provided
  `finish()` function MUST be called to complete the removal of the activity,
  or it will remain in the Activity stack.

* **onBlur**() This is called if another Activity is pushed onto the stack
  without pausing the curent activity. See **Launch Modes**. Always followed by `onFocus()`.

* **onFocus**() Always called after `onBlur()` when the Activity is back on the
  top of the stack.

## Launch Modes

* **STANDARD** A new instance of the activity is created every time it is
  requested to start.

* **SINGLE_TOP** Same as `STANDARD`, except that if the top activity in the
  stack is the type of Activity we're trying to launch, re-use it.

* **SINGLE_INSTANCE**

* **FLAG_CLEAR_TOP**

## Usage

## Tern Support

The source files are all decorated with [JSDoc3](http://usejsdoc.org/)-style
annotations that work great with the [Tern](http://ternjs.net/) code inference
system. Combined with the Node plugin (see this project's `.tern-project`
file), you can have intelligent autocomplete for methods in this library.

## Testing

Testing is done with [Tape](http://github.com/substack/tape) and can be run
with the command `npm test`.

Automated CI cross-browser testing is provided by
[Testling](http://ci.testling.com/bvalosek/activities).


## License
Copyright 2014 Brandon Valosek

**Activities** is released under the MIT license.


