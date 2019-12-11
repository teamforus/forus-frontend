const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop.markup';

// change platform name
platform.setName('webshop_markup');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-general/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "general/style-webshop-general.scss";
    task.watch = [
        "_common/**/*.scss",
        "general/**/*.scss"
    ];

    return task
});

// tweak pug configs
platform.editTask('pug', (task) => {
    task.src = "markup/*.pug";
    task.path = "/markup";
    task.watch = [
        "layout/**/*.pug"
    ];

    return task
});

// tweak js configs
platform.editTask('js', (task) => {
    task.src = "app.markup.js";
    task.dest = "/";
    task.name = "app.min.js";
    task.minify = false;
    task.sourcemap = false;
    task.browserify = true;

    return task;
});

// change server port
platform.serve(3000, '/');

module.exports = platform;