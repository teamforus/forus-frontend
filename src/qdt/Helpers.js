var fs = require('fs');
var path = require('path');
var colors = require('colors');
var readline = require('readline');
var glob = require('glob');
var camelCase = require("lodash/camelCase");
const { spawnSync } = require('child_process');

// plugins: pug, sass, autoprefixer, minify-css, rename, concat and other
const plugins = require('gulp-load-plugins')();
const qdt_verbose = require('./Lang.js');

// build list paths for specified platform
const qdtBuidAssetPaths = function(platform) {
    return JSON.parse(JSON.stringify(platform.assets)).map(asset => ({
        from: path.resolve('./sources/' + platform.source + '/' + asset.from),
        to: path.resolve(platform.paths.root, asset.to)
    }));
};

const fetchLibAsset = (libs, key) => {
    return libs.reduce((outArr, lib) => {
        return outArr.concat(lib[key] || []);
    }, []).map(path => glob.sync(path)).reduce((outArr, paths) => {
        return outArr.concat(paths);
    }, []);
};

const concatFiles = (paths) => {
    return paths.map(path => fs.readFileSync(path).toString().split("\n").filter(line => {
        return !line.startsWith("//# sourceMappingURL=") &&
            !line.startsWith("/*# sourceMappingURL=");
    }).join("\n")).join("\n");
};

const buildLibsBundle = (requiredLibs) => {
    let paths = requiredLibs.map(lib => {
        return __dirname + '/../libs/' + lib + '.js'
    }).map(path => {
        return fs.existsSync(path) ? require(path) : false;
    }).filter(lib => lib);

    let js = fetchLibAsset(paths, 'js');
    let css = fetchLibAsset(paths, 'css');
    let fonts = fetchLibAsset(paths, 'fonts');
    let assets = fetchLibAsset(paths, 'assets');

    return {
        js: concatFiles(js),
        css: concatFiles(css),
        fonts: fonts,
        assets: assets,
    }
};

// show notification
const doNotify = function(title, message) {
    console.log("Error title: " + title + "\n");
    console.log("Error message: " + message + "\n");
    console.log('--- '.repeat(20) + "\n");

    plugins.notify({
        message: message,
        title: title,
        templateOptions: {
            date: new Date()
        },
        emitError: true
    }).write('');
};

const getParams = function() {
    // ignore node, gulp and task name from argv
    const argv = process.argv.filter(arg => arg.indexOf('--') === 0);
    const params = { _length: argv.length };

    argv.forEach(function(arg) {
        arg = arg.slice(2, arg.length).split('=');

        params[camelCase(arg[0])] = typeof (arg[1]) == 'undefined' ? true : arg[1];
        params._length++;
    });

    return params;
};

const parseWatchField = (item) => {
    if (typeof item.watch == 'undefined') {
        return [];
    } else if (['string', 'undefined'].includes(typeof item.watch)) {
        return [item.watch];
    }

    return item.watch;
};

const parseSrcField = (item) => {
    if (typeof item.src == 'string') {
        return [item.src];
    } else if (typeof item.src.length == 'undefined') {
        return [item.src];
    }

    return item.src;
};

const parseDestField = (item) => {
    if (typeof item.dest == 'undefined') {
        return ['/'];
    } else if (['string', 'undefined'].includes(typeof item.dest)) {
        return [item.dest];
    }

    return item.dest;
};

const compileConfig = function(configs) {
    for (var _key in configs.platforms) {
        configs.platforms[_key].name = _key;
    }

    const platforms = configs.platforms;

    const asset_filter = function(val) {
        if (map_story.indexOf(val.from + '|' + val.to) !== -1)
            return false;

        map_story.push(val.from + '|' + val.to);
        return val;
    };

    const settings_map_js = function(item) {
        // source scss files are required
        if (typeof item.src == 'undefined') {
            return console.log(colors.yellow("\nError: javascript 'src' should be speficied!\n"));
        }

        // source javascript files format
        item.src = parseSrcField(item);

        // watch included files, not required
        item.watch = parseWatchField(item);

        // destination folder (by default: "assets/js" folder)
        item.dest = parseDestField(item);
        if (typeof item.dest == 'undefined')
            item.dest = ['/'];
        else if (typeof item.dest == 'string')
            item.dest = [item.dest];
        else if (typeof item.dest.length == 'undefined')
            item.dest = [item.dest];

        // output (compiled) file name, "app.js" by default
        if (typeof item.name == 'undefined')
            item.name = '';

        return item;
    };

    const settings_map_scss = function(item) {
        // source scss files are required
        if (typeof item.src == 'undefined') {
            return console.log(colors.yellow("\nError: scss 'src' should be speficied!\n"));
        }

        // source scss files format
        item.src = parseSrcField(item);

        // watch included files, not required
        item.watch = parseWatchField(item);

        // destination folder (by default: "assets/css" folder)
        item.dest = parseDestField(item);

        // output (compiled) file name, "app.scss" by default
        if (typeof item.name == 'undefined')
            item.name = 'app.scss';

        return item;
    };

    const settings_map_pug = function(item) {
        // required to keep raw hierarchy
        if (typeof item.path == 'undefined') {
            item.path = '/';
        }

        // source scss files are required
        if (typeof item.src == 'undefined') {
            return console.log(colors.yellow("\nError: pug 'src' should be speficied!\n"));
        }

        // source scss files format
        item.src = parseSrcField(item);

        // watch included files, not required
        item.watch = parseWatchField(item);

        // destination folder (by default: root folder (one))
        item.dest = parseDestField(item, []);

        return item;
    };

    for (var k in configs.platforms) {
        if (typeof configs.platforms[k] != 'object')
            continue;

        if (!configs.platforms[k].enabled) {
            continue;
        }

        if (configs.platforms[k].source == "sample") {
            console.log(colors.red('Error platform "' +
                configs.platforms[k].name + '" is using "sample" as ' +
                'it\'s source and will be disabled!\n'));
            continue;
        }

        var map_story = [];

        platforms[k].assets = platforms[k].assets.filter(asset_filter);

        if (typeof platforms[k].tasks.scss.length == 'undefined')
            platforms[k].tasks.scss = [platforms[k].tasks.scss];

        if (typeof platforms[k].tasks.pug.length == 'undefined')
            platforms[k].tasks.pug = [platforms[k].tasks.pug];

        if (typeof platforms[k].tasks.js.length == 'undefined')
            platforms[k].tasks.js = [platforms[k].tasks.js];

        platforms[k].tasks.scss = platforms[k].tasks.scss.map(settings_map_scss);
        platforms[k].tasks.pug = platforms[k].tasks.pug.map(settings_map_pug);
        platforms[k].tasks.js = platforms[k].tasks.js.map(settings_map_js);
    }

    configs.platforms = platforms;

    return configs;
};

var groupPlatforms = function(_platforms) {
    var grouped_platforms = {};

    // group platforms
    for (var n in _platforms) {
        if (!grouped_platforms.hasOwnProperty(_platforms[n].source)) {
            grouped_platforms[_platforms[n].source] = [];
        }

        grouped_platforms[_platforms[n].source].push(_platforms[n]);
    }

    return grouped_platforms;
};

const composeDestPath = function(_path, append) {
    _path = path.parse(_path);
    return path.join(_path.dir, _path.name + append + _path.ext);
}

/**
 * Get git log output
 * 
 * @returns 
 */
const getGitLog = (params) => {
    if (!params.gitHash && !params.gitLog) {
        return false;
    }

    const gitLog = spawnSync('git log;', { shell: true });

    if (gitLog.stdout) {
        return gitLog.stdout.toString();
    }

    console.error('Could not fetch git log!', gitLog.stderr.toString());

    return false;
}

/**
 * Get latest git commit hash
 * 
 * @param {*} params 
 * @returns 
 */
const getGitCommitHash = (params) => {
    const gitLog = getGitLog(params);

    if (!gitLog) {
        return false;
    }

    const hash = gitLog.split("\n")[0].split(" ")[1].trim();
    const branch = spawnSync("git rev-parse --abbrev-ref HEAD", { shell: true }).stdout.toString().trim();

    if (params.gitLog) {
        fs.writeFileSync(path.resolve(__dirname, '../', params.gitLog), gitLog);
    }

    return `${branch}:${hash}`;
}

const isReady = function(envFile, verbose) {
    if (!fs.existsSync(envFile)) {
        if (verbose) {
            console.log(colors.red(
                "Please add \"qdt-env.json\" or \"qdt-env.js\" first.\n" +
                "Run \"gulp init\" to create it automatic."
            ));
        }

        return false;
    }

    return true;
};

const ask = function(question) {
    return new Promise(function(resolve) {
        console.log(question);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '> '
        });

        rl.prompt();

        rl.on('line', function(line) {
            line = line.trim().toUpperCase();

            // stop prompt and input stream
            rl.close();
            process.stdin.pause();

            // check answer
            if ((line == 'Y' || line == 'N')) {
                return resolve(line == 'Y');
            }

            // ask again
            qdt_core.ask(qdt_verbose.core_ask_wrong_input).then(resp => resolve(resp));
        });
    });
};

module.exports = {
    ask,
    isReady,
    doNotify,
    getParams,
    compileConfig,
    groupPlatforms,
    buildLibsBundle,
    composeDestPath,
    getGitCommitHash,
    qdtBuidAssetPaths,
};