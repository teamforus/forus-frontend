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
    "bootstrap3",
    "angular",
    'angular_i18n',
    "angular_cookies",
    "angular_sanitize",
    "angular_translate",
    "angular_translate_storage_cookies",
    "angular_translate_storage_local",
    "mdi",
    "qrcodejs",
    "ui_cropper",
    "ui_router",
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
        "app.website.js",
    ],
    watch: [
        "angular-1/**/**.js",
    ],
    dest: "/",
    name: "app.min.js",
    minify: false,
    sourcemap: true,
    browserify: true
}, 'js');

// add scss task
platform.addTask('scss', {
    src: "general/website/style.scss",
    watch: [
        "general/website/**/*.scss",
    ],
    path: "/",
    name: "style.min.css",
    minify: false
}, 'scss');

// add pug task
platform.addTask('pug', {
    path: "/website",
    src: [
        "website/index.pug"
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