const glob = require('glob');
const gulp = require('gulp');
const { assetsSuffix, reloadBrowserSync, makeNotifier } = require('../Library');
const { composeDestPath } = require('../Helpers');
const plugins = require('gulp-load-plugins')();
const streamCombiner = require('stream-combiner');

// typescript required libs
const browserify = require("browserify");
const vinyl_source = require('vinyl-source-stream');
const vinyl_buffer = require('vinyl-buffer');
const tsify = require("tsify");

const jsCompilerBrowserify = (name, sourcesList, useTypescript) => {
    const stream = [];

    // Browserify & Babelify
    const _browserify = browserify({
        basedir: '.',
        debug: false,
        entries: sourcesList,
        cache: {},
        packageCache: {}
    });

    if (useTypescript) {
        _browserify = _browserify.plugin(tsify);
    }

    stream.push(_browserify.transform('babelify', {
        presets: ["@babel/preset-env"],
        extensions: ['.js']
    }).bundle());

    stream.push(_browserify.transform('pugify', {
        extensions: ['.pug'],
        compileDebug: false,
        pretty: false
    }).bundle());

    // Required for Browserify & Babelify
    stream.push(vinyl_source(name));
    stream.push(vinyl_buffer());

    return stream;
};

const jsCompilerValila = (name, sourcesList) => {
    const stream = [];

    if (hasTypeScript) {
        console.log(colors.red(
            "\nWarning! \nTo compile TypeScript files, enable " +
            "browserify option in your configuration file!\n"
        ));
    }

    stream.push(gulp.src(sourcesList.reverse()));

    if (name) {
        stream.push(plugins.concat(name));
    }

    return stream;
};

const jsCompiler = function(platform, src, task) {
    let resolve;
    let resolvedCount = 0;

    const promise = new Promise(_resolve => resolve = _resolve);

    const dest = task.dest;
    const name = composeDestPath(task.name, !platform.env_data.disable_timestamps ? assetsSuffix : '');
    const sources = [];

    const resolveMultiple = () => ++resolvedCount == dest.length ? resolve() : null;
    const onError = makeNotifier('JavaScript', resolve);
    const hasTypeScript = sources.some((source) => path.parse(source).ext == '.ts');

    src.forEach((_src) => {
        var result = glob.sync(_src);

        if (result.length > 0) {
            sources.push(result);
        }
    });

    const sourcesList = [].concat.apply([], sources);
    const useTs = hasTypeScript || task.typeScript;

    if (sourcesList.length == 0) {
        return;
    }

    for (var i = dest.length - 1; i >= 0; i--) {
        const stream = task.browserify ? jsCompilerBrowserify(name, sourcesList, useTs) : jsCompilerValila(name, sourcesList);
        stream.push(plugins.insert.prepend('var env_data = ' + JSON.stringify(platform.env_data) + ';'));

        // uglify output
        if (typeof task.minify == 'undefined' ? true : task.minify) {
            stream.push(plugins.terser());
        }

        // sourcemap
        if (task.sourcemap) {
            stream.push(plugins.sourcemaps.init());
            stream.push(plugins.sourcemaps.write('./'));
        }

        stream.push(gulp.dest(platform.paths.assets + '/js/' + dest[i]));
        stream.push(reloadBrowserSync(platform));

        streamCombiner.apply(streamCombiner, stream).on('error', onError).on('error', onError).on('end', resolveMultiple);
    }

    return promise;
};

module.exports = jsCompiler;