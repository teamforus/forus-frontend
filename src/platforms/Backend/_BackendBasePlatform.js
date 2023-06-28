/**
 * This platform is not meant to be used directly
 */
const Platform = require('../../qdt/Platform');

// set platform source and destination folder
platform = new Platform('forus-backend');

// add libs to bundle (see libs folder)
platform.setLibs([
    "babel_polyfill",
    "jquery",
    "angular",
]);

// tweaking output and cleaned paths config
platform.setDest(`./`);
platform.setAssetsPath(`./assets`);

// add js task
platform.addTask('js', {
    src: [
        "app.js"
    ],
    watch: [
        "angular-js/**/**.js",
        "angular-js/**/**.pug",
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
    path: "/tpl",
    src: [
        "tpl/**/*.pug"
    ],
    dest: "/assets/tpl",
    minify: true
}, 'pug_raw');

module.exports = platform;
