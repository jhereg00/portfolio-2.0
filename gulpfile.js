/**
 *  All gulp tasks are stored in separate files/folders and just included here for neatness
 */
// dev flag?
if (process.argv.indexOf('--dev') != -1)
  global.devMode = true;
global.devPath = 'dev';
global.distPath = 'dist';

global.serverPort = 8001;

var gulp = require('gulp');
var webserver = require('gulp-webserver');
gulp.task('sass',require('./gulp-tasks/sass'));
gulp.task('scripts',require('./gulp-tasks/scripts'));
gulp.task('images',require('./gulp-tasks/images'));
gulp.task('html',require('./gulp-tasks/html'));
gulp.task('autoguide',require('./gulp-tasks/autoguide'));

// start a server for easy dev
gulp.task('server',require('./gulp-tasks/webserver'));

// watch
gulp.task('watch',['build'], function () {
  global.devMode = true;
  gulp.watch([global.devPath + '/scss/**/*'],['sass','autoguide']);
  gulp.watch([global.devPath + '/js/**/*'],['scripts','autoguide']);
  gulp.watch([global.devPath + '/images/**/*'],['images']);
  gulp.watch([global.devPath + '/**/*.html'],['html']);
});
// watch alias
gulp.task('dev',['watch'],require('./gulp-tasks/webserver'));

// build
gulp.task('build',['sass','scripts','images','html','autoguide']);
