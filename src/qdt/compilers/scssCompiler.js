const gulp = require('gulp');
const { assetsSuffix, reloadBrowserSync, makeNotifier } = require('../lib');
const { composeDestPath } = require('../qdt-helpers');
const plugins = require('gulp-load-plugins')();
const streamCombiner = require('stream-combiner');

const scssCompiler = async function(platform, src, task) {
    let resolve;

    const streams = [];
    const promise = new Promise(_resolve => resolve = _resolve);
    const onError = makeNotifier('SCSS', resolve);

    const scssSettings = {
        outputStyle: (task.minify || true).minify ? "compressed" : "expanded",
        indentWidth: 4
    };

    const prefixedSettings = {
        browfsers: ['> 1%', 'IE >= 8'],
        cascade: false
    };

    streams.push(gulp.src(src));
    streams.push(plugins.sass(scssSettings));
    streams.push(plugins.autoprefixer(prefixedSettings.autoPrefixer));
    streams.push(plugins.rename(composeDestPath(task.name, !platform.env_data.disable_timestamps ? assetsSuffix : '')));
    streams.push(gulp.dest(platform.paths.assets + '/css/' + task.dest));
    streams.push(reloadBrowserSync(platform));

    streamCombiner.apply(streamCombiner, streams).on('error', onError).on('end', resolve);

    return promise;
};

module.exports = scssCompiler;