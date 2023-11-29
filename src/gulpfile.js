// gulp itself
const gulp = require('gulp');

const jsTask = require('./qdt/tasks/jsTask');
const pugTask = require('./qdt/tasks/pugTask');
const initTask = require('./qdt/tasks/initTask');
const scssTask = require('./qdt/tasks/scssTask');
const libsTask = require('./qdt/tasks/libsTask');
const watchTask = require('./qdt/tasks/watchTask');
const clearTask = require('./qdt/tasks/clearTask');
const serverTask = require('./qdt/tasks/serverTask');
const assetsTask = require('./qdt/tasks/assetsTask');
const sourceAddTask = require('./qdt/tasks/sourceAddTask');
const sourceRemoveTask = require('./qdt/tasks/sourceRemoveTask');

// soruce add
gulp.task('source:add', (done) => sourceAddTask('name') & done());

// soruce remove
gulp.task('source:remove', sourceRemoveTask);

// javascript task
gulp.task('js', jsTask);

// pug task
gulp.task('pug', pugTask);

// scss task
gulp.task('scss', scssTask);

// libs task
gulp.task('libs', libsTask);

// assets task
gulp.task('assets', assetsTask);

// clear task
gulp.task('clear', clearTask);

// clear task alias
gulp.task('clean', clearTask);

// server task
gulp.task('server', serverTask);

// server task alias
gulp.task('serve', serverTask);

// initialize qdt on fresh install
gulp.task('init', initTask);

// watch changes
gulp.task('watch', gulp.parallel([
    serverTask, watchTask
]));

// build task
gulp.task('build', gulp.series([
    scssTask, pugTask, jsTask, assetsTask, libsTask
]), done => done());

// build task alias
gulp.task('compile', gulp.series([
    'build'
]), done => done());

// default task
gulp.task('default', gulp.series([
    'compile', 'watch'
]), done => done());