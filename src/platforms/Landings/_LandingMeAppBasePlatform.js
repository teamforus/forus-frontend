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
    "angular_cookies",
    "angular_sanitize",
    "angular_translate",
    "angular_translate_storage_cookies",
    "angular_translate_storage_local",
    "mdi",
    "qrcodejs",
    "ui_router"
]);

// add js task
platform.addTask('js', {
    src: [
        "app.landing-meapp.js",
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
    path: "/landing-meapp",
    src: [
        "landing-meapp/index.pug"
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