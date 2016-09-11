/**
 *  Debounce resize events
 *  @param function to run on resize (after 300 ms wait)
 *  @method remove
 *    @param function to remove from the resize stack
 *
 *  this is a simpler version of adding a resize function to the loop feature.
 *  I recommend sticking with the loop if using it, but this is lighter if you're not.
 */

var resizeTimeout;
var resizeFunctions = [];
var doResize = function () {
  for (var i = 0, len = resizeFunctions.length; i < len; i++) {
    resizeFunctions[i]();
  }
}
window.addEventListener('resize',function () {
  if (resizeTimeout)
    clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    doResize();
  }, 300);
});
window.addEventListener('load',function () {
  doResize();
});

var addResizeFunction = function (fn) {
  if (typeof fn === 'function' && resizeFunctions.indexOf(fn) == -1)
    resizeFunctions.push(fn);
}
var removeResizeFunction = function (fn) {
  for (var i = 0, len = resizeFunctions.length; i < len; i++) {
    if (resizeFunctions[i] == fn) {
      resizeFunctions.splice(i,1);
      return true;
    }
  }
  return false;
}

module.exports = addResizeFunction;
module.exports.remove = removeResizeFunction;
