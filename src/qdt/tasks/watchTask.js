const gulp = require('gulp');
const { grouped_platforms } = require('../Lib');

const jsCompiler = require('../compilers/jsCompiler');
const pugCompiler = require('../compilers/pugCompiler');
const scssCompiler = require('../compilers/scssCompiler');

const _iif_scss = function(_group, platform, task) {
    var _watch_src = [task.src];
    var _path = 'sources/' + _group + '/scss/';

    if (typeof task.watch == "string") {
        task.watch = [task.watch];
    }

    if (typeof task.watch == "undefined") {
        task.watch = [];
    }

    _watch_src = _watch_src.concat(task.watch).map((value) => _path + value);

    gulp.watch(_watch_src).on('change', async () => {
        return await scssCompiler(platform, _path + task.src, task);
    });
};

const _iif_js = function(_group, platform, task) {
    var _path = 'sources/' + _group + '/js/';
    var _raw_src = [];
    var _watch_src = [];

    if (typeof task.src == "string") {
        task.src = [task.src];
    }

    for (var i = task.src.length - 1; i >= 0; i--) {
        _raw_src.push(_path + task.src[i]);
    }

    if (typeof task.watch == "string") {
        task.watch = [task.watch];
    }

    for (var j = (task.watch || []).length - 1; j >= 0; j--) {
        _watch_src.push(_path + task.watch[j]);
    }

    gulp.watch(_raw_src.concat(_watch_src)).on('change', async () => {
        await jsCompiler(platform, _raw_src, task);
    });
};

const _iif_pug = function(_group, platform, group) {
    var _raw_src = [];
    var _watch_src = [];

    var _path = 'sources/' + _group + '/pug/';

    if (typeof group.src == "string") {
        group.src = [group.src];
    }

    for (var i = group.src.length - 1; i >= 0; i--) {
        _raw_src.push(_path + group.src[i]);
    }

    if (typeof group.watch == "undefined") {
        group.watch = [];
    }

    if (typeof group.watch == "string") {
        group.watch = [group.watch];
    }

    for (var j = group.watch.length - 1; j >= 0; j--) {
        _watch_src.push(_path + group.watch[j]);
    }

    gulp.watch(_raw_src).on('change', async (path) => {
        await pugCompiler(__dirname + '/' + _path + '/' + group.path, platform, path, group.dest, group);
    });

    gulp.watch(_watch_src).on('change', async () => {
        await pugCompiler(__dirname + '/' + _path + '/' + group.path, platform, _raw_src, group.dest, group);
    });
};

const watchTask = async () => {
    const sources = Object.keys(grouped_platforms);

    sources.forEach(async (source) => {
        for (var _a = grouped_platforms[source].length - 1; _a >= 0; _a--) {
            const js = grouped_platforms[source][_a].tasks.js;
            const pug = grouped_platforms[source][_a].tasks.pug;
            const scss = grouped_platforms[source][_a].tasks.scss;

            // js
            for (var _js = js.length - 1; _js >= 0; _js--) {
                await _iif_js(source, grouped_platforms[source][_a], grouped_platforms[source][_a].tasks.js[_js]);
            }

            // pug (ex. jade)
            for (var _pug = pug.length - 1; _pug >= 0; _pug--) {
                await _iif_pug(source, grouped_platforms[source][_a], grouped_platforms[source][_a].tasks.pug[_pug]);
            }

            // scss
            for (var _scss = scss.length - 1; _scss >= 0; _scss--) {
                await _iif_scss(source, grouped_platforms[source][_a], grouped_platforms[source][_a].tasks.scss[_scss]);
            }
        }
    });
};

module.exports = watchTask;