const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-midzomermokum.panel';

// change platform name
platform.setName('webshop_midzomermokum');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-midzomermokum/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "midzomermokum/style-webshop-midzomermokum.scss";
    task.watch = [
        "_common/**/*.scss",
        "midzomermokum/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5610, '/');

module.exports = platform;