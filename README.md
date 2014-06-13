# Activities

[![Build Status](https://travis-ci.org/bvalosek/activities.png?branch=master)](https://travis-ci.org/bvalosek/activities)
[![NPM version](https://badge.fury.io/js/activities.png)](http://badge.fury.io/js/activities)

Traverse the application stack with managed state lifecycle.

[![browser support](https://ci.testling.com/bvalosek/activities.png)](https://ci.testling.com/bvalosek/activities)

## Installation

```
$ npm install activities
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

The idea is to abstract application state into de-coupled classes, with a
standard interface to handle transitioning between those states. This module is
potentially useful in a wide range of uses cases from Single Page Apps managing
difference screens and dialogs, to games maintaining different scenes, menus,
and modes.

## Lifecycle Methods

Any class can be used as an activity. To add functionality that occurs during
state transitions, implement any of the following methods to a class:

* **onCreate**(`bundle`) Activity has been initiated. Do all one-time setup and
  initialization code here. Can receive data from whatever started the
  application via the optional `bundle` parameter.

* **onStart**() Activity has been started. This is called a single time to
  indicate the activity is about to allow interaction with the user.

* **onResume**() Activity is now ready for interaction with the user. Called
  after `onStart()` or when returning from a paused state. This function could
  be called several times of the duration of the activity.

* **onPause**() Application is about to resume another activity, or this
  activity is getting shut down. Save any state or suspend and updating /
  monitoring here. Always called before `onStop()`.

* **onStop**() Activity is shutting down. Put any shutdown / finishing /
  unbinding behavior here. Called only once, right before `onDestroy()`.

* **onDestroy**(`finish: Function`) Called right before the activity is removed
  from the stack. If an activity implements this function, the provided
  `finish()` function MUST be called to complete the removal of the activity,
  or it will remain in the Activity stack indefinitely.

* **onBlur**() This is called if another Activity is pushed onto the stack
  without pausing the current activity. See **Launch Modes**. Always followed
  by `onFocus()`.

* **onFocus**() Always called after `onBlur()` when the Activity is back on the
  top of the stack.

## Launch Modes

* **STANDARD** A new instance of the activity is created every time it is
  requested to start.

* **SINGLE_TOP** Same as `STANDARD`, except that if the top activity in the
  stack is the type of Activity we're trying to launch, re-use it.

* **SINGLE_INSTANCE** Whenever an activity is launched, re-use an existing
  activity if there is one of the same type in the stack.

* **FLAG_CLEAR_TOP** OR-able flag to add to the mode that indicates to clear
  all activities below the launched activty. e.g., `SINGLE_INSTANCE |
  FLAG_CLEAR_TOP`.

## Usage

### Setup the `ActivityManager` and `Navigator`

Ideally, your `ActivityManager` should be handled at the top application level
with some sort of IoC container. All examples will just "assume" we have the
`navigator` available somehow.

```javascript
var ActivityManager = require('activities').ActivityManager;

var manager   = new ActivityManager();
var navigator = manager.navigator;
```

### Defining an Activity and Lifecycle Methods

An activity is any Javascript class:

```
function HelloActivity()
{
  this.name = '';
};

HelloActivity.prototype.hello = function()
{
  console.log('Hello, ' + (this.name || 'World') + '!');
};
```

But for it to be interesting, let's implement some of the lifecycle methods:

```javascript
HelloActivity.prototype.onStart = function()
{
  console.log('starting...');
  this.hello();
};
```

And start the activity (like at the root of your application):

```javascript
navigator.start(HelloActivity);
// starting...
// Hello, World!
```

We can pass data into an activity when we start it, which will
be received in the `onCreate` method:

```javascript
HelloActivity.prototype.onCreate = function(data)
{
  console.log('creating...');
  this.name = data;
};
```

Start the activity with a third parameter to pass in data (the middle parameter
specifies the *launch mode*):

```javascript
navigator.start(HelloActivity, null, 'Brandon');
// creating...
// starting...
// Hello, Brandon!
```

When an activity is torn down, it runs through the `onPause()`, `onStop()`, and
`onDestroy()` lifecycle events if available.

```javascript
HelloActivity.prototype.onPause = function()
{
  console.log('pausing...');
};

HelloActivity.prototype.onStop = function()
{
  console.log('stopping...');
  console.log('Goodbye, ' + (this.name || 'World') + '!');
};
```

And `onResume` is fired every time the Activity is made primary:

```javascript
HelloActivity.prototype.onResume = function()
{
  console.log('resumed!');
};
```

Launching more than one activity pauses the underlying one:

```javascript
var a1 = navigator.start(HelloActivity, null, 'John');
// creating...
// starting...
// Hello, John!
// resumed!

var a2 = navigator.start(HelloActivity);
// pausing... [ from a1 ]
// creating...
// starting...
// Hello, World!
// resumed!

navigator.finish(a2);
// pausing... [ from a2 ]
// stopping...
// Goodbye, World!
// resumed! [ from a1 ]
```

The `onDestroy` method is passed a `finish` function as its single parameter,
which MUST be called to remove the activity from the stack and finalize the
removal. This allows for asynchronous cleanup if needed.

```javascript
HelloActivity.prototype.onDestroy = function(finish)
{
  setTimeout(finish, 1000);
};
```

If an activity doesn't implement `onDestroy()`, then the activity will be removed
from the stack immediately after stopping.

## Testing

```
$ npm test
```

## License

MIT

