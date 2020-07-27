const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.markup';

// change platform name
platform.setName('dashboard_markup');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-general/**/*", "./");

// tweak pug configs
platform.editTask('pug', (task) => {
    task.src = "markup/*.pug";
    task.path = "/markup";
    task.watch = [
        "layout/**/*.pug"
    ];

    return task;
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

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "general/style-dashboard-general.scss";
    task.watch = [
        "_common/**/*.scss",
        "general/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(3100, '/');

module.exports = platform;