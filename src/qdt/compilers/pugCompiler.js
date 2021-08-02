const gulp = require('gulp');
const { assetsSuffix, reloadBrowserSync, makeNotifier, params } = require('../lib');
const plugins = require('gulp-load-plugins')();
const streamCombiner = require('stream-combiner');

const qdt_core = require("../qdt-helpers");
const { getGitCommitHash } = qdt_core;

const pugCompiler = function(source, platform, src, dest, task) {
    let resolve;

    const streams = [];
    const promise = new Promise(_resolve => resolve = _resolve);
    const onError = makeNotifier('PUG', resolve);

    const pugConfig = {
        data: {
            qdt_c: {
                git_log_header: getGitCommitHash(params) || false,
                append_assets: !platform.env_data.disable_timestamps ? assetsSuffix : '',
                platform: platform
            }
        },
        pretty: !(task.minify || false)
    };

    streams.push(gulp.src(src, { base: source }));
    streams.push(plugins.pug(pugConfig));
    streams.push(gulp.dest(platform.paths.root + dest));
    streams.push(reloadBrowserSync(platform));

    streamCombiner(streams).on('error', onError).on('end', resolve);

    return promise;
};

module.exports = pugCompiler;