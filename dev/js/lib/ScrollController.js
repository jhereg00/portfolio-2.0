/**
 *  Useful class for handling parallaxing things
 *  Stores object measurements and returns percentage of scroll when asked
 *
 *  @param DOMElement
 *  [@param] function to call on scroll, passed the scroll percentage and pixels
 *
 *  @method measure() - remeasures the element's position on the page
 *  @method getPercentage() - returns scroll percentage based on current window scroll position
 *    @returns Number
 *  @method getPixels() - returns how many pixels past the top of the element the window is
 *    @returns Number
 *  @method disable() - stop listening for the passed scroll function
 *  @method enable() - start listening for the scroll function. Only needed if previously disabled
 *  @method destroy() - stop listening and get out of memory
 */

// helpers
var getPageOffset = require('lib/getPageOffset'),
    windowSize = require('lib/windowSize'),
    loop = require('lib/loop')
    ;


var ScrollController = function ScrollController (element, onScroll) {
  if (!this instanceof ScrollController)
    return new ScrollController(element);

  var _this = this;
  this.element = element;

  // get measurements immediately
  this.measure();
  if (onScroll)
    onScroll(_this.getPercentage());

  // listeners
  this.onResize = function measureScrollController () {
    _this.measure();
  }
  if (onScroll) {
    this.onScroll = function scrollScrollController () {
      onScroll.apply(_this, [_this.getPercentage(), _this.getPixels()]);
    }
  }

  // start 'er up
  this.enable();
}
ScrollController.prototype = {
  measure: function () {
    var po = getPageOffset(this.element);
    this.top = Math.max(po.top - windowSize.height(), 0);
    this.bottom = po.top + this.element.offsetHeight;
    this.height = this.bottom - this.top;
  },
  getPercentage: function () {
    var scrollY = loop.getLastScrollPos();
    var perc = (scrollY - this.top) / (this.height);
    return perc;
  },
  getPixels: function () {
    return loop.getLastScrollPos() - this.top;
  },
  disable: function () {
    loop.removeFunction(this.onResize);
    if (this.onScroll)
      loop.removeFunction(this.onScroll);
  },
  enable: function () {
    loop.addResizeFunction(this.onResize);
    if (this.onScroll)
      loop.addScrollFunction(this.onScroll);
  },
  destroy: function () {
    this.disable();
    delete this;
  }
}

module.exports = ScrollController;
