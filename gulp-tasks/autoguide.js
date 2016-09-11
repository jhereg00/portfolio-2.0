var autoguide = require('autoguide');

var autoguideTask = function (done) {
  autoguide({
    src: [
      global.devPath + '/scss',
      global.devPath + '/js'
    ],
    vars: [
      global.devPath + '/scss/settings'
    ],
    dest: global.distPath + '/styleguide',
    styles: [
      '../css/styles.css'
    ],
    scripts: [
      '../js/scripts.js'
    ]
  }, function (err) {
    done();
  });
}

module.exports = autoguideTask;
