'use strict';

var gulp = require('gulp');
var gulpTypescript = require('gulp-typescript');
var gulpTSLint = require('gulp-tslint');
var gulpDebug = require('gulp-debug');

var browserSync = require('browser-sync').create();
var fs = require('fs-extra');
var runSequence = require('run-sequence');

var buildOptions = {
    version: '1.0.0',
    distPath: './dist',
	libPath: './lib',
	srcPath:  './src',
	testPath: './test',
	isDebug: true
};


// Gulp Tasks
gulp.task('compile-typescript', function(cb){
	return gulp.src('src/**/*.ts')
        .pipe(gulpTypescript({
            //noImplicitAny: true,
            out: 'd3chart.js'
        }))
        .pipe(gulp.dest( buildOptions.distPath + '/js'));
});

gulp.task('compile-less', function (cb) {
    //TODO
});

gulp.task('run-tslint', function(cb){
	gulp.src(
		[
			buildOptions.srcPath + '**/*.ts',
			buildOptions.testPath + '**/*.ts',
			'!' + buildOptions.libPath + '**',
			'!' + buildOptions.distPath + '**'
		])
	.pipe(gulpTSLint({
		configuration: {
			rules: {
				'no-debugger': !buildOptions.isDebug
			}
		}
	}))
	.pipe(gulpTSLint.report('verbose', {
		reportLimit: 1000
	}))
	.on('error', function (err) {
		cb(new Error('TSLint returned errors.'));
	})
	.on('end', cb);
});

gulp.task('copy-src', function(cb) {
	return gulp.src([
		buildOptions.srcPath + '/**',
		'!' + buildOptions.distPath,
		'!' + buildOptions.distPath + '/**',
		'!' + buildOptions.srcPath + '/**/*.ts',
		'!' + buildOptions.srcPath + '/**/*.less'])
		.pipe(gulp.dest(buildOptions.distPath));
});

gulp.task('serve', ['default'], function(cb) {
	console.log('Setting up file watcher');

	var _ = require('lodash');
	var path = require('path');
	var reload = browserSync.reload;

	var watcher = gulp.watch([
		buildOptions.srcPath + '**/*.less',
		buildOptions.srcPath + '**/*.ts',
		buildOptions.srcPath + '**/*.xml',
		buildOptions.srcPath + '**/*.htm',
		buildOptions.srcPath + '**/*.html',
		buildOptions.srcPath + '**/*.json',
		buildOptions.srcPath + '**/*.resjson',
		buildOptions.testPath + '**/*.ts',
		buildOptions.testPath + '**/*.xml',
		'!' + buildOptions.libPath + '**',
		'!' + buildOptions.distPath + '**'
	]);

	watcher.on('change', function (event) {
		console.log('File ' + event.path + ' was ' + event.type + '.');
		if (event.type === 'changed') {
			var filePath = event.path.replace(/\\/g, '/'); // Replace back slashes with forward slashes
			if (_.endsWith(filePath, '.less')) {
				runSequence('compile-less', reload);
			} else if (_.endsWith(filePath, '.ts')) {
				runSequence(['run-tslint', 'compile-typescript'], function (err) {
					if (err) {
						console.error(err);
					} else {
						reload();
					}
				});
			} else {
				// Copy the file to the dist folder
				var absoluteSourcePath = path.resolve(buildOptions.srcPath).replace(/\\/g, '/');
				if (_.startsWith(filePath, absoluteSourcePath)) {
					var destinationFilePath = buildOptions.distPath + "/" + filePath.substring(absoluteSourcePath.length + 1);
					console.log('Copying ' + filePath + ' to ' + destinationFilePath);
					fs.copy(filePath, destinationFilePath, function (err) {
						console.log('Copying ' + filePath + ' to ' + destinationFilePath + ' finished');
						if (err) {
							console.error(err);
						} else {
							reload();
						}
					});
				} else {
					// A test file changed (does not require to be copied)
					reload();
				}
			}
		}
	});
	console.log('Setting up file watcher finished');
    // Start browser sync

    var browserSyncOptions = {
        notify: false,
        port: 9005,
        ui: !buildOptions.isDefaultTask ? {
            port: 9015,
            weinre: {
                port: 9016
            }
        } : false,
        open: true,
        // Server config
        server: {
            baseDir: buildOptions.distPath
        }
    };

    browserSync.init(browserSyncOptions, cb);
});

gulp.task('clean', function(cb) {
    fs.remove(buildOptions.distPath, cb);
});

gulp.task('build', function(cb) {
	runSequence('copy-src', 'compile-typescript', 'run-tslint', cb);
});

gulp.task('default', function(cb) {
    runSequence('clean', 'build', cb);
});