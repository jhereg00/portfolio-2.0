var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    newer = require('gulp-newer')
    ;

module.exports = function images () {
  return gulp.src([global.devPath + '/images/**/*'])
    .pipe(newer(global.distPath + '/images/'))
    .pipe(imagemin())
    .pipe(gulp.dest(global.distPath + '/images/'));
}
