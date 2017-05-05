"use strict";

var gulp = require('gulp');
var gulpTSLint = require('gulp-tslint');
var gulpDebug = require('gulp-debug');
var browserify = require('browserify');
var tsify = require("tsify");
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync').create();
var fs = require('fs-extra');
var runSequence = require('run-sequence');
let isSingleBuild = true;

var buildOptions = {
    version: '1.0.0',
    distPath: './dist',
    srcPath: './src',
    testPath: './test',
    isDebug: true
};

// Gulp Tasks
gulp.task('compile-typescript', function (cb) {
    return browserify({
        basedir: buildOptions.srcPath,
        debug: buildOptions.isDebug,
        entries: ['Index.ts'],
        extension: ['js', 'ts']
    })
        .plugin(tsify)
        .bundle()
        .on('error', function (error) {
            if (isSingleBuild) {
                throw new Error(error);
            }
            console.error(error.toString());
        })
        .pipe(source('d3.charts.js'))
        .pipe(gulp.dest(buildOptions.distPath + "/js"));
});

gulp.task('compile-less', function (cb) {
    //TODO
});

gulp.task('run-tslint', function (cb) {
    gulp.src(
        [
            buildOptions.srcPath + '/typescript/**/*.ts',
            buildOptions.testPath + '/test/**/*.ts',
            '!' + buildOptions.srcPath + '/typescript/typings/**',
            '!' + buildOptions.distPath + '**'
        ])
        .pipe(gulpDebug({ title: 'Linting' }))
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

gulp.task('copy-src', function (cb) {
    return gulp.src([
        buildOptions.srcPath + '/**',
        '!' + buildOptions.distPath,
        '!' + buildOptions.distPath + '/**',
        '!' + buildOptions.srcPath + '/typescript/**/*.ts',
        '!' + buildOptions.srcPath + '/less/**/*.less'])
        .pipe(gulp.dest(buildOptions.distPath));
});

gulp.task('serve', ['default'], function (cb) {
    isSingleBuild = false;
    console.log('Setting up file watcher');

    var _ = require('lodash');
    var path = require('path');
    var reload = browserSync.reload;

    var watcher = gulp.watch([
        buildOptions.srcPath + '**/css/*.css',
        buildOptions.srcPath + '**/data/*.txt',
        buildOptions.srcPath + '**/examples/*.html',
        buildOptions.srcPath + '**/less/*.less',
        buildOptions.srcPath + '**/typescript/**/*.ts',
        buildOptions.srcPath + '**/*.htm',
        buildOptions.srcPath + '**/*.html',
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

gulp.task('clean', function (cb) {
    fs.remove(buildOptions.distPath, cb);
});

gulp.task('build', function (cb) {
    runSequence('clean', 'copy-src', 'run-tslint', 'compile-typescript', cb);
});

gulp.task('default', function (cb) {
    runSequence('build', cb);
});