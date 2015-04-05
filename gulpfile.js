var gulp = require('gulp'),
    karma = require('karma').server,
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    transform = require('vinyl-transform'),
    projectName = require('./package.json').name,
    sourceFile = ['./src/index.js'];

var browserified = function(standalone) {
 return transform(function(filename) {
   if (standalone) {
     var b = browserify({standalone: projectName});
     b.add(filename);
   } else {
     var b = browserify();
     b.require(filename, {expose: projectName});
   }
   return b.bundle();
 });
}

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('build-browserify', function() {
  gulp.src(sourceFile)
    .pipe(browserified())
    .pipe(rename(projectName + '.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./examples/sapiaPicture'))
    .pipe(uglify())
    .pipe(rename(projectName + '.min.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./examples/sapiaPicture'));
});

gulp.task('build-standalone', function() {
  gulp.src(sourceFile)
    .pipe(browserified(true))
    .pipe(rename(projectName + '-standalone.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(gulp.dest('./examples/sapiaPicture'))
    .pipe(uglify())
    .pipe(rename(projectName + '-standalone.min.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./examples/sapiaPicture'));
});

/**
 * Run test once and exit
 */
gulp.task('test',  ['lint'], function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

gulp.task('test-debug', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: false,
    autoWatch: true
  }, done);
});

gulp.task('build', ['build-browserify', 'build-standalone']);
gulp.task('default', ['test', 'build']);
