// file system
var fs = require('fs');
var fse = require('fs-extra');
var del = require('del');
var glob = require('glob');
var path = require('path');
var compress = require('compression');
var historyApiFallback = require('connect-history-api-fallback')
var protractor = require('gulp-protractor').protractor;
var child_process = require('child_process');
let sprintf = require('sprintf-js').sprintf;


// console colors
const colors = require('colors');

// qdt helper
const qdt_core = require("./qdt/qdt-helpers");
const qdt_verbose = require("./qdt/qdt-verbose");

// gulp itself
const gulp = require('gulp');
const params = qdt_core.getParams() || {};
const envFile = params.envFile ? params.envFile : './qdt-env.js';

require('./qdt-config').getConfig();

function compose_dest_path(_path, append) {
    _path = path.parse(_path);
    return path.join(_path.dir, _path.name + append + _path.ext);
}

let timestamp = Date.now();
let includeTimestamp = !!params.timestamp;
let assetsSuffix = includeTimestamp ? '-' + timestamp : '';

let gitLog = false;
let gitLogHeader = false;

if (params.gitHash || params.gitLog) {
    try {
        gitLog = child_process.execSync('git log').toString();
    } catch (error) {
        console.error('Could not fetch git log!');
    }
}

if (params.gitHash && gitLog) {
    let branch = child_process.execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    gitLogHeader = sprintf("%s:%s", branch, gitLog.split("\n")[0].split(" ")[1].trim());
}

if (params.gitLog && gitLog) {
    fs.writeFileSync(path.resolve(__dirname, params.gitLog), gitLog);
}

// check env existence
if (fs.existsSync(envFile)) {
    // environment
    var qdt_e = require(envFile);

    // configurations
    var qdt_c = qdt_core.compileConfig({
        platforms: qdt_e(require('./qdt/Core')).getConfig()
    });

    // group platform by source
    var grouped_platforms = qdt_core.groupPlatforms(qdt_c.platforms);

    // plugins: pug, sass, autoprefixer, minify-css, rename, concat and other
    var plugins = require('gulp-load-plugins')();

    // stream combiner 
    var streamCombiner = require('stream-combiner');

    // browser syncronization
    var browserSync = {};
    var browserSyncReload = {};

    Object.keys(qdt_c.platforms).forEach(function(platform) {
        browserSync[platform] = require('browser-sync').create();
        browserSyncReload[platform] = browserSync[platform].reload;
    });

    // typescript required libs
    var browserify = require("browserify");
    var vinyl_source = require('vinyl-source-stream');
    var vinyl_buffer = require('vinyl-buffer');
    var tsify = require("tsify");

    var pluginSettings = {
        autoPrefixer: {
            browfsers: ['> 1%', 'IE >= 8'],
            cascade: false
        },
        browserSyncReload: {
            stream: true
        }
    };
}

// test required
if (typeof process.argv[2] == 'undefined' || process.argv[2] != 'init') {
    if (!qdt_core.isReady(envFile, true)) {
        process.exit(0);
    }
}

var sourceAddTask = function(nameParam) {
    if (params.length === 0 || typeof params[nameParam] == 'undefined') {
        return console.log(colors.red(qdt_verbose.source_add_unk_name));
    }

    fs.exists("./sources/" + params[nameParam], function(exists) {
        if (exists) {
            return console.log(colors.red(qdt_verbose.source_add_exists_name));
        }

        gulp.src('./sources/sample/**/**').pipe(
            gulp.dest('./sources/' + params[nameParam])
        );

        console.log(colors.green(qdt_verbose.source_add_done.replace('[name]', params[nameParam])));
    });
};

gulp.task('source:add', function(done) {
    sourceAddTask('name');
    done();
});

gulp.task('source:remove', function(done) {
    if (params.length === 0 || typeof params.name == 'undefined') {
        return console.log(colors.red(qdt_verbose.source_remove_unk_name));
    }

    if (params.name == 'sample') {
        return console.log(colors.red(qdt_verbose.source_remove_sample_name));
    }

    fs.exists("./sources/" + params.name, function(exists) {
        if (!exists) {
            var message = qdt_verbose.source_remove_not_found_name.replace(
                '[name]', params.name
            );

            return console.log(colors.red(message));
        }

        del("./sources/" + params.name, {
            force: true
        }).then(res => {
            console.log(colors.green(qdt_verbose.source_remove_done.replace('[name]', params.name)));
        });
    });

    done();
});

var scss_compiler = async function(platform, src, task) {
    let resolve;
    let promise = new Promise(_resolve => resolve = _resolve);

    if (src.length == 0) {
        return;
    }

    // notifiers
    var _doNotify = function(val) {
        qdt_core.doNotify('SCSS - Error', val);
        resolve();
    };

    var streams = [];

    // by default minify
    if (typeof task.minify == 'undefined') {
        task.minify = true;
    }

    streams.push(gulp.src(src));
    streams.push(plugins.sass({
        outputStyle: task.minify ? "compressed" : "expanded",
        indentWidth: 4
    }));

    streams.push(plugins.autoprefixer(pluginSettings.autoPrefixer));

    streams.push(plugins.rename(compose_dest_path(
        task.name,
        !platform.env_data.disable_timestamps ? assetsSuffix : ''
    )));

    streams.push(gulp.dest(platform.paths.assets + '/css/' + task.dest));

    if (platform.server) {
        streams.push(browserSync[platform.name].reload(
            pluginSettings.browserSyncReload
        ));
    }

    streamCombiner.apply(streamCombiner, streams).on('error', _doNotify).on('end', resolve);

    return promise;
};

var js_compiler = function(platform, src, task) {
    let resolve;
    let resolvedCount = 0;
    let resolveMultiple = () => {
        if (++resolvedCount == dest.length) {
            resolve();
        }
    };
    let promise = new Promise(_resolve => resolve = _resolve);

    var dest = task.dest;
    var name = compose_dest_path(task.name, !platform.env_data.disable_timestamps ? assetsSuffix : '');
    var sources = [];

    // notifiers
    var _doNotify = function(val) {
        qdt_core.doNotify('JavaScript - Error', val);
        resolveMultiple();
    };

    src.forEach(_src => {
        var result = glob.sync(_src);

        if (result.length > 0) {
            sources.push(result);
        }
    });

    sources = [].concat.apply([], sources);

    if (sources.length == 0) {
        return;
    }

    // return console.log(sources);
    for (var i = dest.length - 1; i >= 0; i--) {
        var stream = [];
        var hasTypeScript = sources.some(source => {
            return path.parse(source).ext == '.ts';
        });

        if (task.browserify) {
            // Browserify & Babelify
            var _browserify = browserify({
                basedir: '.',
                debug: false,
                entries: sources,
                cache: {},
                packageCache: {}
            });

            if (hasTypeScript || task.typeScript) {
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
        } else {
            if (hasTypeScript) {
                console.log(colors.red(
                    "\nWarning! \nTo compile TypeScript files, enable " +
                    "browserify option in your configuration file!\n"
                ));
            }

            stream.push(gulp.src(sources.reverse()));

            if (name) {
                stream.push(plugins.concat(name));
            }
        }

        // uglify output
        if (task.minify) {
            stream.push(plugins.uglify());
        }

        // sourcemap
        if (task.sourcemap) {
            stream.push(plugins.sourcemaps.init());
            stream.push(plugins.sourcemaps.write('./'));
        }

        stream.push(plugins.insert.prepend(
            'var env_data = ' + JSON.stringify(platform.env_data) + ';'
        ));

        stream.push(gulp.dest(platform.paths.assets + '/js/' + dest[i]));

        if (platform.server) {
            stream.push(browserSync[platform.name].reload(
                pluginSettings.browserSyncReload
            ));
        }

        streamCombiner.apply(streamCombiner, stream).on('error', _doNotify).on('error', _doNotify).on('end', resolveMultiple);
    }

    return promise;
};

var assets_compiler = async function(source) {
    // notifiers
    var _doNotify = function(val) {
        qdt_core.doNotify('Assets - Error', val);
    };

    var _grouped_platforms = grouped_platforms[source].filter(function(item) {
        return item;
    });

    if (_grouped_platforms.length === 0)
        return false;

    let chain = [];

    _grouped_platforms.map(function(item) {
        var list_assets = qdt_core.qdtBuidAssetPaths(item);

        for (var i = list_assets.length - 1; i >= 0; i--) {
            let asset = list_assets[i];
            chain.push(() => {
                return new Promise(resolve => {
                    streamCombiner(
                        gulp.src(asset.from),
                        gulp.dest(asset.to)
                    ).on('error', (val) => {
                        resolve();
                        _doNotify(val);
                    }).on('end', resolve);
                });
            });
        }
    });

    while (chain.length > 0) {
        await chain.pop()();
    }
};

var pug_compiler = function(source, platform, src, dest, task) {
    let resolve;
    let promise = new Promise(_resolve => resolve = _resolve);

    if (src.length == 0) {
        return;
    }

    // notifiers
    var _doNotify = function(val) {
        qdt_core.doNotify('Pug - Error', val);
        resolve();
    };

    var streams = [];

    streams.push(gulp.src(src, {
        base: source
    }),
        plugins.pug({
            data: {
                qdt_c: {
                    git_log: gitLog || false,
                    git_log_header: gitLogHeader || false,
                    append_assets: !platform.env_data.disable_timestamps ? assetsSuffix : '',
                    platform: platform
                }
            },
            pretty: (typeof task.minify == 'undefined') ? false : !task.minify
        }),
        gulp.dest(platform.paths.root + dest));

    if (platform.server) {
        streams.push(browserSync[platform.name].reload(
            pluginSettings.browserSyncReload
        ));
    }

    streamCombiner(streams).on('error', _doNotify).on('end', resolve);

    return promise;
};

let scssTask = async (done) => {
    var _iif_scss = async function(_k_scss, platform, group) {
        var _path = 'sources/' + _k_scss + '/scss/';

        if (typeof group.src == 'string') {
            group.src = [group.src];
        }

        await scss_compiler(platform, group.src.map(src => _path + src), group);
    };

    // scss
    for (var k_scss in grouped_platforms) {
        for (var _a = grouped_platforms[k_scss].length - 1; _a >= 0; _a--) {
            var _scss_s = grouped_platforms[k_scss][_a].tasks.scss;

            for (var _aa = _scss_s.length - 1; _aa >= 0; _aa--) {
                await (_iif_scss)(k_scss, grouped_platforms[k_scss][_a],
                    grouped_platforms[k_scss][_a].tasks.scss[_aa]);
            }
        }
    }

    done();
};

let jsTask = async (done) => {
    var _iif_js = async function(_k_js, platform, group) {
        var _path = 'sources/' + _k_js + '/js/';
        var _srv = [];
        var task = group;

        if (typeof group.src == "string") {
            group.src = [group.src];
        }

        for (var i = group.src.length - 1; i >= 0; i--) {
            _srv.push(_path + group.src[i]);
        }

        await js_compiler(platform, _srv, task);
    };

    // js
    for (var k_js in grouped_platforms) {
        for (var _b = grouped_platforms[k_js].length - 1; _b >= 0; _b--) {
            var _js_s = grouped_platforms[k_js][_b].tasks.js;

            for (var _ba = _js_s.length - 1; _ba >= 0; _ba--) {
                await (_iif_js)(k_js, grouped_platforms[k_js][_b],
                    grouped_platforms[k_js][_b].tasks.js[_ba]);
            }
        }
    }

    done();
};

let assetsTask = async (done) => {
    for (var k in grouped_platforms) {
        await assets_compiler(k);
    }

    done();
};

let libsTask = (done) => {
    Object.values(grouped_platforms).forEach(platforms => {
        platforms.forEach(platform => {
            let bundle = qdt_core.buildLibsBundle(platform.libs);
            let assestPath = (file) => path.resolve(
                __dirname, platform.paths.assets + file
            );

            while (bundle.js.indexOf("map/*") !== -1) {
                bundle.js = bundle.js.replace("map/*", "map\n/*");
            }

            fse.mkdirpSync(assestPath('/dist/bundle/js'));
            fse.writeFileSync(compose_dest_path(
                assestPath('/dist/bundle/js/bundle.min.js'),
                !platform.env_data.disable_timestamps ? assetsSuffix : ''
            ), bundle.js);

            fse.mkdirpSync(assestPath('/dist/bundle/css'));
            fse.writeFileSync(compose_dest_path(
                assestPath('/dist/bundle/css/bundle.min.css'),
                !platform.env_data.disable_timestamps ? assetsSuffix : ''
            ), bundle.css);

            fse.mkdirpSync(assestPath('/dist/bundle/fonts'));
            bundle.fonts.forEach(font => {
                fse.copyFileSync(
                    path.resolve(__dirname, font),
                    assestPath('/dist/bundle/fonts/' + path.parse(font).base)
                );
            });
        });
    });

    return done();
};

let pugTask = async (done) => {
    var _iif = async function(_k_pug, platform, task) {
        var _raw_src = [];
        var _path = 'sources/' + _k_pug + '/pug/';

        for (var i = task.src.length - 1; i >= 0; i--) {
            _raw_src.push(_path + task.src[i]);
        }

        await pug_compiler(__dirname + '/' + _path + '/' + task.path, platform, _raw_src, task.dest, task);
    };

    // pug (ex. jade)
    for (var k_pug in grouped_platforms) {
        for (var i = grouped_platforms[k_pug].length - 1; i >= 0; i--) {
            var _pug_s = grouped_platforms[k_pug][i].tasks.pug;
            for (var j = _pug_s.length - 1; j >= 0; j--) {
                await (_iif)(k_pug, grouped_platforms[k_pug][i], grouped_platforms[k_pug][i].tasks.pug[j]);
            }
        }
    }

    done();
};

let serverTask = () => {
    Object.values(grouped_platforms).reduce(
        (acc, platforms) => acc.concat(platforms), []
    ).filter(platform => platform.server).forEach(function(platform) {
        var server = {
            server: {
                baseDir: platform.paths.root + platform.server.path,
                middleware: [compress(), (req, res, next) => {
                    const headers = platform.server.headers || {};

                    for (const key in headers) {
                        res.setHeader(key, headers[key]);
                    }

                    next();
                }],
            },
            notify: true,
            open: false,
            port: platform.server.port || 3000,
            rewriteRules: [
                {
                    match: /script /g,
                    fn: function (req, res, match) {
                        return `script nonce='1Py20ko19vEhus6l1yvGJw=='`;
                    }
                },
                {
                    match: /style /g,
                    fn: function (req, res, match) {
                        return `style nonce='1Py20ko19vEhus6l1yvGJw=='`;
                    }
                },
            ],
            ui: {
                port: (platform.server.port || 3000) + 1,
            }
        };

        if (platform.env_data.html5ModeEnabled) {
            server.server.middleware.push(historyApiFallback());
        }

        browserSync[platform.name].init(server);
    });
};

let watchTask = () => {
    var _iif_scss = function(_k_scss, platform, task) {
        var _watch_src = [task.src];
        var _path = 'sources/' + _k_scss + '/scss/';

        if (typeof task.watch == "string") {
            task.watch = [task.watch];
        }

        if (typeof task.watch == "undefined") {
            task.watch = [];
        }

        _watch_src = _watch_src.concat(task.watch).map(value => {
            return _path + value;
        });

        gulp.watch(_watch_src).on('change', async () => {
            await scss_compiler(platform, _path + task.src, task);
        });
    };

    var _iif_assets = function(_k_assets) {
        gulp.watch('./sources/' + _k_assets + '/assets/**/*.*', function(cb) {
            assets_compiler(_k_assets);
        });
    };

    var _iif_js = function(_k_js, platform, task) {
        var _path = 'sources/' + _k_js + '/js/';
        var _raw_src = [];
        var _watch_src = [];

        if (typeof task.src == "string") {
            task.src = [task.src];
        }

        if (typeof task.watch == "string") {
            task.watch = [task.watch];
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
            await js_compiler(platform, _raw_src, task);
        });
    };

    var _iif_pug = function(_k_pug, platform, group) {
        var _raw_src = [];
        var _watch_src = [];

        var _path = 'sources/' + _k_pug + '/pug/';

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
            await pug_compiler(__dirname + '/' + _path + '/' + group.path, platform, path, group.dest, group);
        });

        gulp.watch(_watch_src).on('change', async () => {
            await pug_compiler(__dirname + '/' + _path + '/' + group.path, platform, _raw_src, group.dest, group);
        });
    };

    // scss
    for (var k_scss in grouped_platforms) {
        for (var _a = grouped_platforms[k_scss].length - 1; _a >= 0; _a--) {
            var _scss_s = grouped_platforms[k_scss][_a].tasks.scss;

            for (var _aa = _scss_s.length - 1; _aa >= 0; _aa--) {
                (_iif_scss)(k_scss, grouped_platforms[k_scss][_a],
                    grouped_platforms[k_scss][_a].tasks.scss[_aa]);
            }
        }
    }

    // js
    for (var k_js in grouped_platforms) {
        for (var _b = grouped_platforms[k_js].length - 1; _b >= 0; _b--) {
            var _js_s = grouped_platforms[k_js][_b].tasks.js;

            for (var _ba = _js_s.length - 1; _ba >= 0; _ba--) {
                (_iif_js)(k_js, grouped_platforms[k_js][_b],
                    grouped_platforms[k_js][_b].tasks.js[_ba]);
            }
        }
    }

    // assets
    for (var k_assets in grouped_platforms) {
        (_iif_assets)(k_assets);
    }

    // pug (ex. jade)
    for (var k_pug in grouped_platforms) {
        for (var i = grouped_platforms[k_pug].length - 1; i >= 0; i--) {
            var _pug_s = grouped_platforms[k_pug][i].tasks.pug;

            for (var j = _pug_s.length - 1; j >= 0; j--) {
                (_iif_pug)(k_pug, grouped_platforms[k_pug][i],
                    grouped_platforms[k_pug][i].tasks.pug[j]);
            }
        }
    }
};

let initTask = (done) => {
    (new Promise(function(resolve) {
        resolve(fs.existsSync(envFile));
    })).then(function(exists) {
        return new Promise(function(resolve) {
            // environment configs not exists
            if (!exists) return resolve(null);

            // ask to override
            qdt_core
                .ask(qdt_verbose.task_init_env_exists, true)
                .then(resolve);
        });
    }).then(function(resp) {
        if (resp === false) {
            return console.log(qdt_verbose.task_init_keep_env) && done();
        }

        if (resp === null) {
            console.log(qdt_verbose.task_init_gen_env);
        }

        if (resp === true) {
            console.log(qdt_verbose.task_init_override_env);
        }

        var sampleEnvFile = './qdt-env.sample.js';

        if (!fs.existsSync(sampleEnvFile)) {
            sampleEnvFile = './qdt-env.sample.json';
        }

        // create env config file
        fs.FileReadStream(sampleEnvFile).pipe(fs.FileWriteStream(
            './qdt-env.js'
        ));

        if (params != 'undefined' && typeof params.source != 'undefined') {
            sourceAddTask('source');
        }
    });

    done();
};

let clearTask = (done) => {
    let paths = Object.values(qdt_c.platforms).map((platform) => {
        if (!platform.enabled || !platform.paths.clean) {
            return [];
        }

        if (typeof platform.paths.clean == 'string') {
            return [platform.paths.clean];
        }

        return platform.paths.clean;
    }).reduce((arr, value) => {
        return arr.concat(value);
    }, []);

    del(paths, {
        force: true
    }).then(() => done());
};

let browserstackTask = function(cb) {
    gulp.src(['test/e2e/testcases/*-spec.js']).pipe(protractor({
        configFile: 'test/e2e/protractor.browserstack.conf.js'
    })).on('error', function(e) {
        console.log(e);
    }).on('end', cb);
};

let protractorTask = function(cb) {
    gulp.src(['test/e2e/testcases/*-spec.js']).pipe(protractor({
        configFile: 'test/e2e/protractor.conf.js'
    })).on('error', function(e) {
        console.log(e);
    }).on('end', cb);
};

// clear task
gulp.task('clear', clearTask);

// clear task alias
gulp.task('clean', clearTask);

// scss task
gulp.task('scss', scssTask);

// javascript task
gulp.task('js', jsTask);

// assets task
gulp.task('assets', assetsTask);

// libs task
gulp.task('libs', libsTask);

// pug task
gulp.task('pug', pugTask);

// server task
gulp.task('server', serverTask);

// server task alias
gulp.task('serve', serverTask);

// initialize qdt on fresh install
gulp.task('init', initTask);

// Setting up the test task
gulp.task('browserstack', browserstackTask);

// Setting up the test task
gulp.task('protractor', protractorTask);

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

// default test
gulp.task('test', gulp.series([
    'browserstack', 'protractor'
]), done => done());

// default task
gulp.task('default', gulp.series([
    'compile', 'watch'
]), done => done());