/**
 *  extendObject function
 *
 *  extend one object with another object's property's (default is deep extend)
 *  this works with circular references and is faster than other deep extend methods
 *  http://jsperf.com/comparing-custom-deep-extend-to-jquery-deep-extend/2
 *
 *  based on this gist: https://gist.github.com/fshost/4146993
 */
var array = '[object Array]',
    object = '[object Object]',
    targetMeta,
    sourceMeta;

function setMeta (value) {
  // checks what type of value we have, array, object, or other
  var jclass = {}.toString.call(value);
  if (value === undefined) return 0;
  else if (typeof value !== 'object') return false;
  else if (jclass === array) return 1;
  else if (jclass === object) return 2;
};

function extendObject (target, source, shallow) {
  for (var key in source) {
    // iterate through props in source object
    if (source.hasOwnProperty(key)) {
      targetMeta = setMeta(target[key]);
      sourceMeta = setMeta(source[key]);
      if (source[key] !== target[key]) {
        // not the same, better update target
        if (!shallow && sourceMeta && targetMeta && targetMeta === sourceMeta) {
          // deep extend if of same type
          target[key] = extendObject(target[key], source[key], true);
        } else if (sourceMeta !== 0) {
          // shallow, or just set to source's prop
          target[key] = source[key];
        }
      }
    }
    else break; // hasOwnProperty === false, meaning we're through the non-prototype stuff
  }
  return target;
}

module.exports = extendObject;
