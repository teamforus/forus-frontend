const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-noordoostpolder.panel';

// change platform name
platform.setName('webshop_noordoostpolder');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-noordoostpolder/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "noordoostpolder/style-webshop-noordoostpolder.scss";
    task.watch = [
        "_common/**/*.scss",
        "noordoostpolder/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5590, '/');

module.exports = platform;