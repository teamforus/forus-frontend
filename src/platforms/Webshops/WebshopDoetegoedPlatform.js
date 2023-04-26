const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-doetegoed.panel';

// change platform name
platform.setName('webshop_doetegoed');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-doetegoed/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "doetegoed/style-webshop-doetegoed.scss";
    task.watch = [
        "_common/**/*.scss",
        "doetegoed/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5690, '/');

module.exports = platform;