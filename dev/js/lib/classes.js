/**
 *  cross browser functions to add/remove/check classes
 *
 *  exports:
 *    @method add
 *      @param DOMElement
 *      @param class : string || array of strings
 *    @method remove
 *      @param DOMElement
 *      @param class : string || array of strings
 *    @method has
 *      @param DOMElement
 *      @param class : string || array of strings
 *      @returns boolean : whether or not the class(es) are present
 *    @method toggle
 *      @param DOMElement
 *      @param class : string || array of strings
 */

// check if classList is supported
var classListSupported = document.createElement('svg').classList !== undefined;
var addClass, removeClass, hasClass;
if (classListSupported) {
  // modern browsers
  addClass = function (el,className) {
    if (className instanceof Array) {
      for (var i = 0, len = className.length; i < len; i++) {
        el.classList.add(className[i]);
      }
    }
    else {
      el.classList.add(className);
    }
  }
  removeClass = function (el,className) {
    if (className instanceof Array) {
      for (var i = 0, len = className.length; i < len; i++) {
        el.classList.remove(className[i]);
      }
    }
    else {
      el.classList.remove(className);
    }
  }
  hasClass = function (el,className) {
    if (className instanceof Array) {
      for (var i = 0, len = className.length; i < len; i++) {
        if (!el.classList.contains(className[i]))
        return false;
      }
      return true;
    }
    else {
      return el.classList.contains(className);
    }
  }
}
else {
  // shitty browsers. need much bigger things involving regex
  addClass = function (el, className) {
    if (el.className && el.className.baseVal !== undefined) {
      // support SVG
      if (typeof className === 'string') {
        className = className.split(' ');
      }

      var elClassList = el.className.baseVal.split(' ') || [];
      for (var i = 0, len = classList.length; i < len; i++) {
        if (elClassList.indexOf(classList[i]) === -1) {
          el.className.baseVal += " " + classList[i];
        }
      }
    }
    else {
      // normal element
      // check if it's already there...
      var re = new RegExp('(?:^|\\s)(' + className.replace(/\-/g,'\\-') + ')(?:$|\\s)');
      if (!el.className.match(re)) {
        if (el.className === "")
        el.className = className;
        else
        el.className += " " + className;
      }
    }
  }
  // remove class from element
  removeClass = function (el, className) {
    if (el.className && el.className.baseVal !== undefined) {
      // support SVG
      if (typeof className === 'string') {
        className = className.split(' ');
      }

      for (var i = 0, len = className.length; i < len; i++) {
        var reClass = new RegExp('\\b' + classList[i] + '\\b\\s*?','g');
        el.className.baseVal = el.className.baseVal.replace(reClass,'');
      }
    }
    else {
      // normal element
      if (typeof className === 'string') {
        className = className.split(' ');
      }
      console.log('remove ', el, className);

      for (var i = 0, len = className.length; i < len; i++) {
        var re = new RegExp('(^|\\s)(' + className[i].replace(/\-/g,'\\-') + ')($|\\s)');
        el.className = el.className.replace(re,function($0,$1,$2,$3) {
          return $1 == " " ? $1 : $3;
        }).trim();
      }
    }
  }
  // check if an element has a class
  hasClass = function (el, className) {
    if (el.className && el.className.baseVal !== undefined) {
      // support SVG
      if (typeof className === 'string') {
        className = className.split(' ');
      }

      for (var i = 0, len = classList.length; i < len; i++) {
        var reClass = new RegExp('\\b' + classList[i] + '\\b\\s*?','g');
        if (!el.className.baseVal.match(reClass))
        break;
        else if (i === len-1) {
          return false; // breaks each
        }
      }
    }
    else {
      // normal element
      var re = new RegExp('(?:^|\\s)(' + className.replace(/\-/g,'\\-') + ')(?:$|\\s)');
      return !!el.className.match(re);
    }
  }
}

var toggleClass = function (el, className) {
  if (hasClass(el, className)) {
    return removeClass(el, className);
  }
  return addClass(el, className);
}

module.exports = {
  add: addClass,
  remove: removeClass,
  has: hasClass,
  toggle: toggleClass
}
