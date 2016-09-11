// just copy html to dist for this prototype
var gulp = require('gulp');

module.exports = function () {
  return gulp.src(global.devPath + '/*.html')
          .pipe(gulp.dest(global.distPath));
}
