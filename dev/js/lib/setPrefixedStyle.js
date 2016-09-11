/**
 *  sets style property with prefixes
 *  @param element
 *  @param property
 *  @param value
 *  @returns boolean, true if successfully set style
 */

var prefixes = ['webkit','moz','ms','o','k'];

var setPrefixedStyle = function (element, property, value) {
  if (element.style[property] !== undefined) {
    element.style[property] = value;
    return true;
  }
  // need a prefix
  var uppercaseProperty = property.replace(/^[a-z]/, function ($0) { return $0.toUpperCase(); });
  for (var i = 0, len = prefixes.length; i < len; i++) {
    if (element.style[prefixes[i] + uppercaseProperty] !== undefined) {
      element.style[prefixes[i] + uppercaseProperty] = value;
      return true;
    }
  }
  return false;
}

module.exports = setPrefixedStyle;
