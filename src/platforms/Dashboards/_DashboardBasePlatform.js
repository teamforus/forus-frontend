/**
 * This platform is not meant to be used directly
 */
const Platform = require('../../qdt/Platform');

// set platform source and destination folder
platform = new Platform('forus-platform');

// add libs to bundle (see libs folder)
platform.setLibs([
    "babel_polyfill",
    "jquery",
    "angular",
    'angular_i18n',
    "angular_cookies",
    "angular_datepicker",
    "angular_sanitize",
    "angular_translate",
    "angular_translate_storage_cookies",
    "angular_translate_storage_local",
    "summernote",
    "turndown",
    // "joplin_turndown_plugin",
    "moment",
    "chart_js",
    "mdi",
    "jszip",
    "nanoscroller",
    "papaparse",
    "progressbar_js",
    "qrcodejs",
    "ui_cropper",
    "ui_router",
    "ui_select",
    "file_saver",
    "pdfjs",
]);

// tweaking output and cleaned paths config
platform.setDest(`./`);
platform.setAssetsPath(`./assets`);
platform.setCleanPath([
    `./`,
    `./assets`
]);

// add js task
platform.addTask('js', {
    src: [
        "app.js"
    ],
    watch: [
        "angular-1/**/**.js",
        "angular-1/**/**.pug",
        "angular-1/**/**.json",
    ],
    dest: "/",
    name: "app.min.js",
    minify: false,
    sourcemap: true,
    browserify: true
}, 'js');

// add scss task
platform.addTask('scss', {
    src: "general/style.scss",
    watch: [
        "_common/**/*.scss",
        "general/**/*.scss"
    ],
    path: "/",
    name: "style.min.css",
    minify: true
}, 'scss');

// add pug task
platform.addTask('pug', {
    path: "/angular-index",
    src: [
        "angular-index/index.pug"
    ],
    watch: [
        "layout/**/*.pug"
    ],
    minify: true
}, 'pug');

// add pug task
platform.addTask('pug', {
    path: "/tpl",
    src: [
        "tpl/**/*.pug"
    ],
    dest: "/assets/tpl",
    minify: true
}, 'pug_raw');

module.exports = platform;
