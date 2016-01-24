var gulp = require('gulp');
var watch = require('gulp-watch');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var es = require('event-stream');

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
	var files = [
		'js/content.js',
		'js/background.js'
	];

	var tasks = files.map(function(entry) {
		return browserify({
				entries: [entry]
			})
			.bundle()
			.on('error', function (e) {
				console.log(e);
			})
			.pipe(source(entry))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(uglify().on('error', function(e) {
				console.log(e);
			}))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest('chrome'));
	});

	return es.merge.apply(null, tasks);
});

gulp.task('default', function() {
	gulp.watch('scss/**/*.scss', ['scss']);
	gulp.watch('js/**/*.js', ['js']);
});