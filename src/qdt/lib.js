// file system
const fs = require('fs');
const path = require('path');
const noop = require('gulp-util/lib/noop');

// qdt helper
const qdt_core = require("./Helpers");
const qdt_verbose = require("./Lang");

const params = qdt_core.getParams() || {};
const envFile = params.envFile ? params.envFile : path.resolve(__dirname, '../', 'qdt-env.js');

require('../qdt-config').getConfig();

const timestamp = Date.now();
const includeTimestamp = !!params.timestamp;
const assetsSuffix = includeTimestamp ? '-' + timestamp : '';

const makeNotifier = (prefix, resolve) => {
    return (val) => {
        qdt_core.doNotify(`${prefix} - Error`, val);

        if (resolve) {
            resolve();
        }
    };
}

const isInit = () => {
    return (process.argv[2] || null) == 'init';
}

// check env existence
if (fs.existsSync(envFile)) {
    // environment
    var qdt_e = require(envFile);

    // configurations
    var qdt_c = qdt_core.compileConfig({
        platforms: qdt_e(require('./Core')).getConfig()
    });

    // group platform by source
    var grouped_platforms = qdt_core.groupPlatforms(qdt_c.platforms);

    // browser syncronization
    var browserSync = {};
    var browserSyncReload = {};

    Object.keys(qdt_c.platforms).forEach(function(platform) {
        browserSync[platform] = require('browser-sync').create();
        browserSyncReload[platform] = browserSync[platform].reload;
    });

    var pluginSettings = {
        autoPrefixer: {
            browfsers: ['> 1%', 'IE >= 8'],
            cascade: false
        },
        browserSyncReload: { stream: true }
    };
}

const reloadBrowserSync = (platform) => {
    return platform.server ? browserSync[platform.name].reload(pluginSettings.browserSyncReload) : noop();
}

// test required
if (!isInit() && !qdt_core.isReady(envFile, true)) {
    process.exit(0);
}

module.exports = {
    qdt_c,
    params,
    envFile,
    qdt_core,
    browserSync,
    qdt_verbose,
    makeNotifier,
    assetsSuffix,
    grouped_platforms,
    reloadBrowserSync,
};