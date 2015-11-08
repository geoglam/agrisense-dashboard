'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');

var config = {
  src: 'src',
  build: 'build',
  dist: 'dist',
  stylusSrc: 'public/css/app.styl',
  stylusWatchSrc: 'public/css/**/*.styl',
  stylusDest: 'build/app/css',
  copyBuildSrc: ['src/app/vendor/**/*.js', 'src/app/**/*.es5.*', 'src/app/images/**/*'],
  copyDistSrc: ['build/app/bootloader.es5.js', 'build/**/*.css', 'build/**/*.html', 'build/app/images/**/*'],
  lintSrc: ['src/app/js/**/*.js', 'src/app/lib/**/*.js'],
  browserSyncSrc: ['build/**/*.html', 'build/**/*.js', 'build/**/*.css']
}
var BROWSER_SYNC_RELOAD_DELAY = 500;

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'app.js',
    watch: ['app.js']
  })
    .on('start', function onStart() {
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      // reload connected browsers after a slight delay
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});
gulp.task('browser-sync', ['nodemon'], function () {
  browserSync({
    proxy: 'http://localhost:3000',
    port: 4000,
    browser: ['google-chrome']
  });
});
gulp.task('js',  function () {
  return gulp.src('public/**/*.js')
});

gulp.task('css', function () {
  return gulp.src('public/**/*.css')
    .pipe(browserSync.reload({ stream: true }));
})

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('default', ['browser-sync'], function () {
  gulp.watch('public/**/*.js',   ['js', browserSync.reload]);
  gulp.watch('public/**/*.css',  ['css']);
  gulp.watch('public/**/*.html', ['bs-reload']);
});