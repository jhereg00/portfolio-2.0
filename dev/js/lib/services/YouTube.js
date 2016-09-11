/**
 *  Controls youtube stuff, including initializing the API and controlling videos
 *  See https://developers.google.com/youtube/iframe_api_reference
 *
 *  TODO: add tests
 */

// helpers
var extend = require('lib/extendObject')
    ;

// save functions called before the API is ready, then fire them off when it is
window.YTApiReady = false;
if (!window.onYTApiReadyFns)
  window.onYTApiReadyFns = [];
var onApiReady = function onYTApiReady (fn) {
  if (window.YTApiReady)
    fn();
  else {
    onYTApiReadyFns.push(fn);
  }
}
window.onYouTubeIframeAPIReady = function () {
  window.YTApiReady = true;
  for (var fn = 0, len = onYTApiReadyFns.length; fn < len; fn++) {
    onYTApiReadyFns[fn].call();
  }
}

// initialize the API
// hang on to this until something needs it
var initStarted = false;
var init = function YTApiInit () {
  if (!initStarted && !window.YT) {
    initStarted = true;
    console.log('initting');

    // add api script
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0] || document.body.children[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

/**
 *  player, which can be initialized elsewhere
 *  @param element - domElement or string with the id of a domElement to add the iframe to
 *  @param videoId - youtube id of the video to play
 *  [@param settings] - extra settings to pass to the player (from the YT API)
 */
var YTPlayer = function YTPlayer (element, videoId, settings) {
  if (!element || !videoId) {
    throw 'YTPlayer requires a valid element and videoId. Was ' + element + ' and ' + videoId;
  }

  if (!this instanceof YTPlayer)
    return new YTPlayer(element, videoId, settings);

  // default player settings
  var defaultSettings = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
      controls: 1,
      enablejsapi: 1,
      modestbranding: 1,
      showinfo: 0,
      origin: window.location.href.match(/^https?:\/\/(.+?)\//)[1],
      rel: 0
    }
  }

  // save settings
  this.element = element;
  this.videoId = videoId;
  this.settings = extend(extend({},defaultSettings),settings);
  // set the video to settings as well
  this.settings.videoId = videoId;

  // initialize the API
  init();

  // safe-call player creation
  var _this = this;
  onApiReady(function () {
    _this.player = _this.createPlayer();
  });
}
YTPlayer.prototype = {
  createPlayer: function () {
    console.log('createPlayer',this.settings);
    return new YT.Player(this.element, this.settings)
  }
}

module.exports = YTPlayer;
