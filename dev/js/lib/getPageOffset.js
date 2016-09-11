/**
 *  get DOMElement's offset from page
 *
 *  @param DOMElement
 *  @returns {
 *    left: Number
 *    top: Number
 *  }
 */
function getPageOffset (element) {
  if (!element) {
    throw 'getPageOffset passed an invalid element';
  }
  var pageOffsetX = element.offsetLeft,
      pageOffsetY = element.offsetTop;

  while (element = element.offsetParent) {
    pageOffsetX += element.offsetLeft;
    pageOffsetY += element.offsetTop;
  }

  return {
    left : pageOffsetX,
    top : pageOffsetY
  }
}

module.exports = getPageOffset;
