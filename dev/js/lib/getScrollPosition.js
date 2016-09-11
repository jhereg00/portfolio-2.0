/**
 *  gets window scroll position in cross browser way
 *
 *  @returns Number
 */
var getScrollPos = (function (undefined) {
  if (window.scrollY !== undefined)
    return function getScrollPos () { return window.scrollY; }
  else
    return function getScrollPos () { return document.documentElement.scrollTop; }
})();

module.exports = getScrollPos;
