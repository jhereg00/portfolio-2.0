/**
 *  get window size, cross browser friendly
 *
 *  @method width()
 *  @method height()
 */
var windowHeight = function windowHeight () {
  return window.innerHeight || document.documentElement.clientHeight;
};
var windowWidth = function windowWidth () {
  return window.innerWidth || document.documentElement.clientWidth;
};

module.exports = {
  width: windowWidth,
  height: windowHeight
}
