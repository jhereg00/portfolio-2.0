var gulp = require('gulp'),
    webserver = require('gulp-webserver');

var webserverTask = function () {
  return gulp.src(global.distPath)
    .pipe(webserver({
      directoryListing : true,
      port : global.serverPort,
      open : "http://localhost:" + global.serverPort + "/"
    }));
}
module.exports = webserverTask;
