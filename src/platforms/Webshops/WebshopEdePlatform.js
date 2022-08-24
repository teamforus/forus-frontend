const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-ede.panel';

// change platform name
platform.setName('webshop_ede');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-ede/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "ede/style-webshop-ede.scss";
    task.watch = [
        "_common/**/*.scss",
        "ede/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5640, '/');

module.exports = platform;