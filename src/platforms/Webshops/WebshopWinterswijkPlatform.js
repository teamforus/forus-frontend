const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-winterswijk.panel';

// change platform name
platform.setName('webshop_winterswijk');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-winterswijk/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "winterswijk/style-webshop-winterswijk.scss";
    task.watch = [
        "_common/**/*.scss",
        "winterswijk/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5580, '/');

module.exports = platform;