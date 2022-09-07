const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-vergoedingen.panel';

// change platform name
platform.setName('webshop_vergoedingen');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-vergoedingen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "vergoedingen/style-webshop-vergoedingen.scss";
    task.watch = [
        "_common/**/*.scss",
        "vergoedingen/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5630, '/');

module.exports = platform;