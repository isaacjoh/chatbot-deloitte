/* =================================================================================================
 * Module dependencies
================================================================================================= */

var gulp = require('gulp'),
    liveserver = require('gulp-live-server'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    path = require('path');

/* =================================================================================================
* Server
================================================================================================= */

var server = liveserver.new('./server.js');
var pathname = '';

gulp.task('run', ['watch'], function() {
  server.start();
});

gulp.task('sass', function() {
  return gulp.src('./*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  watch(['./**/*'], { verbose: true }, function(file) {
    server.notify.apply(server, [file]);
  });
});

gulp.task('build', function() {
  process.exit();
});

gulp.watch('./*.scss', ['sass']);

/* =================================================================================================
* Default
================================================================================================= */

gulp.task('default', ['run'], function() {

});