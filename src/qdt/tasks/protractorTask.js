const gulp = require('gulp');
const path = require('path');
const protractor = require('gulp-protractor').protractor;

const protractorTask = function(onDone) {
    const src = path.resolve(__dirname, '../../test/e2e/testcases/*-spec.js');
    const configFile = path.resolve(__dirname, '../../test/e2e/protractor.conf.js');

    gulp.src(src).pipe(protractor({ configFile })).on('error', console.error).on('end', onDone);
};

module.exports = protractorTask;