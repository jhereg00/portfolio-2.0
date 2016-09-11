/**
 *  Loop
 *
 *  The requestAnimationFrame Loop. It handles animation and state changes
 *  related to scrolling or window sizing. It can also be used for regular js
 *  driven animation as well.
 *
 *  @method addScrollFunction - adds a function to fire whenever scroll
 *      position changes
 *    @param function
 *		@param first - if this function should be prepended to the list instead of
 *			appended
 *  @method addResizeFunction - adds a function to fire whenever the window is
 *      resized, debounced by the value of the resizeDebounce var
 *    @param function
 *		@param first - if this function should be prepended to the list instead of
 *			appended
 *  @method addFunction - adds a function to fire on every iteration of the
 *      loop. Limit the use of this
 *    @param function
 *		@param first - if this function should be prepended to the list instead of
 *			appended
 *  @method removeFunction - removes a function from the list of functions
 *      to fire
 *    @param function
 *  @method start - starts the loop (doesn't need to be called unless the
 *      loop was stopped at some point)
 *  @method stop - stops the loop
 *  @method force - forces the next iteration of the loop to fire scroll and
 *      resize functions, regardless of whether or not either things actually
 *      happened
 *	@method getLastScrollPos - gets the scroll position from the last frame
 *	@method logFps - logs low, high, and average fps
 */

/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish / http://paulirish.com/
 */
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	} )();
}

// other lib helpers
var getScrollPos = require('lib/getScrollPosition');

// private vars
var running = false,
    lastBodyWidth = document.body.offsetWidth, // store width to determine if resize needed
    lastBodyHeight = document.body.offsetHeight, // store height to determine if resize needed
    lastScroll = -1,
    lastTime = new Date().getTime(), // last time so we know how long it's been
    resizeDebounce = 300,

		frames = 0,
		fpsLow = 999,
		fpsHigh = 0,
		frameTimeTotal = 0,
		fpsAverage = 0,
		tooLowFrames = 0,
		tooLowTime = 0
    ;

// save the functions the loop should run
// will be passed currentTime, timeChange
var loopFuncs = {
  resize : [], // functions to run on resize
  scroll : [], // functions to run on scroll
  tick : [] // functions to run every tick
};

// add/remove methods for those functions
var addLoopFunction = function addLoopFunction (type, fn, first) {
  if (loopFuncs[type].indexOf(fn) === -1) { // make sure it doesn't already exist (only works with non-anonymous functions)
		if (first)
			loopFuncs[type].unshift(fn);
		else
    	loopFuncs[type].push(fn);
		start();
    return true;
  }
  return false;
}
var addScrollFunction = function addScrollFunction (fn, first) {
  return addLoopFunction('scroll',fn,first);
}
var addResizeFunction = function addResizeFunction (fn, first) {
  return addLoopFunction('resize',fn,first);
}
var addFunction = function addFunction (fn, first) {
  return addLoopFunction('tick',fn,first);
}
var removeFunction = function removeFunction (fn) {
  var types = ['resize','scroll','tick'];
  var found = false;
  for (var i = 0; i < types.length; i++) {
    var index = loopFuncs[types[i]].indexOf(fn);
    if (index !== -1) {
      loopFuncs[types[i]].splice(index,1);
      found = true;
			loopFnIndex--;
      break;
    }
  }
	// check that we're still listening
  for (var i = 0; i < types.length; i++) {
		if (loopFuncs[types[i]].length)
			break;
		else if (i === types.length - 1)
			stop();
	}
  return found;
}

// do all functions of a given type
var loopFnIndex = 0;
var doLoopFunctions = function doLoopFunctions (type,currentTime) {
  for (loopFnIndex = 0, len = loopFuncs[type].length; loopFnIndex < len; loopFnIndex++) {
		if (loopFuncs[type][loopFnIndex]) // extra check for safety in case some were removed
    	loopFuncs[type][loopFnIndex].call(window,currentTime);
  }
}

// start/stop control
var start = function startLoop () {
	if (!running) {
	  running = true;
		loopFn();
	}
}
var stop = function stopLoop () {
  running = false;
}

// force it to fire next time through by setting lastScroll and lastBodyWidth
// to impossible values
var force = function forceLoop () {
  lastBodyWidth = -1;
  lastScroll = -1;
}

// hold a resize timout so we can debounce it
var resizeTimeout = null;

// the real deal!
// in a closure for maximum safety, and so it autostarts
// note: after checking using jsperf, rather than making one big todo array of
// all the functions, it's faster to call each array of functions separately
function loopFn() {

  // check that we're actually running...
  if (running) {

    var currentTime = new Date().getTime();
    var timeChange = currentTime - lastTime;
    var currentScroll = getScrollPos();

		if (timeChange !== 0) {
	    // check if resize
	    if (document.body.offsetWidth !== lastBodyWidth || document.body.offsetHeight !== lastBodyHeight) {
	      // resize is true, save new sizes
	      lastBodyWidth = document.body.offsetWidth;
	      lastBodyHeight = document.body.offsetHeight;

	      if (resizeTimeout)
	        window.clearTimeout(resizeTimeout);
	      resizeTimeout = window.setTimeout(function () {
	        doLoopFunctions('resize',currentTime);
	      }, resizeDebounce);
	    }

	    // check if scroll
	    if (lastScroll !== currentScroll) {
	      // scroll is true, save new position
	      lastScroll = currentScroll;

	      // call each function
	      doLoopFunctions('scroll',currentTime);
	    }

	    // do the always functions
	    doLoopFunctions('tick',currentTime);

	    // save the new time
	    lastTime = currentTime;

			// watch fps
			if (window.DEBUG) {
				var fps = 1000 / timeChange;
				if (fps < fpsLow) {
					fpsLow = fps;
				}
				if (fps > fpsHigh) {
					fpsHigh = fps;
				}
				if (fps < 30) {
					tooLowFrames++;
					tooLowTime += timeChange;
				}
				frames++;
				frameTimeTotal += timeChange;
				fpsAverage = 1000 / (frameTimeTotal / frames);
			}
		}
		// make sure we do the tick again next time
    requestAnimationFrame(loopFn);
  }
};

// export the useful functions
module.exports = {
  addScrollFunction: addScrollFunction,
  addResizeFunction: addResizeFunction,
  addFunction: addFunction,
  removeFunction: removeFunction,
  start: start,
  stop: stop,
  force: force,
	getLastScrollPos: function () {
		return lastScroll;
	},
	logFps: function () {
		console.log (
			"average : " + fpsAverage + "\n",
			"low : " + fpsLow + "\n",
			"high : " + fpsHigh + "\n",
			"frames < 60 fps : " + tooLowFrames + "\n",
			"time < 60 fps : " + tooLowTime + " (" + (tooLowTime / frameTimeTotal * 100) + "% of total time)"
		);
	}
}
