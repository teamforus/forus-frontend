const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-berkelland.panel';

// change platform name
platform.setName('webshop_berkelland');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-berkelland/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "berkelland/style-webshop-berkelland.scss";
    task.watch = [
        "_common/**/*.scss",
        "berkelland/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5560, '/');

module.exports = platform;