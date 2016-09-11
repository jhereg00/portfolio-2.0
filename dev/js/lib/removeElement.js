/**
 *  cross browser removal of a DOM Element
 *
 *  @param DOMElement
 */

var removeElement = (function () {
  // test if we can use .remove()
  var testEl = document.createElement('div');
  if (testEl.remove && typeof testEl.remove === 'function') {
    return function (element) {
      element.remove();
    }
  }
  // we can't, so get parent and remove from there
  else {
    return function (element) {
      try {
        element.parentNode.removeChild(element);
      } catch (err) {
        console.error(err);
      }
    }
  }
})();

module.exports = removeElement;
