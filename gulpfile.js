/*jslint node: true */
'use strict';
var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function (cb) {
    var mochaErr;

    gulp.src('test/**/*.js')
        .pipe(mocha({
            reporter: 'spec'
        }))
        .on('error', function (err) {
            mochaErr = err;
        })
        .on('end', function () {
            cb(mochaErr);
        });
});

gulp.task('watch', ['test'], function () {
    gulp.watch(['lib/**/*.js', 'test/**'], ['test']);
});

gulp.task('default', ['test']);
