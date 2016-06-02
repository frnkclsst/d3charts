'use strict';

var gulp = require('gulp');
var gulpTypescript = require('gulp-typescript');

var fs = require('fs-extra');
var runSequence = require('run-sequence');

var buildOptions = {
    version: '1.0.0',
    distPath: './dist',
	libPath: './lib',
	srcPath:  './src'
};


// Gulp Tasks
gulp.task('compile-typescript', function(){
	return gulp.src('src/**/*.ts')
        .pipe(gulpTypescript({
            //noImplicitAny: true,
            out: 'd3chart.js'
        }))
        .pipe(gulp.dest( buildOptions.distPath + '/js'));
});

gulp.task('run-tslint', function(){
	// TODO
});

gulp.task('copy-src', function() {
	gulp.src([
		buildOptions.srcPath + '/**',
		'!' + buildOptions.distPath,
		'!' + buildOptions.distPath + '/**',
		'!' + buildOptions.srcPath + '/**/*.ts',
		'!' + buildOptions.srcPath + '/**/*.less'])
		.pipe(gulp.dest(buildOptions.distPath));
});

gulp.task('clean', function (cb) {
    fs.remove(buildOptions.distPath, cb);
});

gulp.task('build', ['copy-src', 'compile-typescript']);

gulp.task('default', function (cb) {
    runSequence('clean', 'build', cb);
});