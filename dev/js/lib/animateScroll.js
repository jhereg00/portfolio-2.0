/**
 *  Animates window scroll position
 *
 *  @param end position in pixels
 */

// requirements
var loop = require('lib/loop');
var eases = require('lib/eases');

// settings
var minDuration = 1000;

// the animation controller
var startTime,
    duration,
    startPos,
    deltaScroll
    ;

var animateScroll = function (currentTime) {
  var deltaTime = currentTime - startTime;
  if (deltaTime < duration) {
    window.scrollTo(0, eases.easeInOutCubic(startPos, deltaScroll, deltaTime / duration));
  }
  else {
    loop.removeFunction(animateScroll);
    window.scrollTo(0, startPos + deltaScroll);
  }
}

var startAnimateScroll = function (endScroll) {
  startTime = new Date().getTime();
  startPos = loop.getLastScrollPos();
  deltaScroll = endScroll - startPos;
  duration = Math.max(minDuration, Math.abs(deltaScroll) * .66);
  animateScroll(startTime);

  loop.removeFunction(animateScroll);
  loop.addFunction(animateScroll);
}

module.exports = startAnimateScroll;
