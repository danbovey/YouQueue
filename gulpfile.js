var gulp = require('gulp');
var watch = require('gulp-watch');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

gulp.task('scss', function() {
    return gulp.src('scss/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(rename('style.css'))
        .pipe(gulp.dest('chrome/css'))
        .pipe(notify("Compiled SCSS"));
});

gulp.task('js', function() {
    gulp.src('js/app.js')
        .pipe(rename('content.js'))
        .pipe(gulp.dest('chrome/js'));

    return gulp.src('js/background.js')
        .pipe(gulp.dest('chrome/js'))
        .pipe(notify('Compiled JS'));
});

gulp.task('default', function() {
    gulp.watch('scss/**/*.scss', ['scss']);
    gulp.watch('js/**/*.js', ['js']);
});