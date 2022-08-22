const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-hartvanwestbrabant.panel';

// change platform name
platform.setName('webshop_hartvanwestbrabant');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-hartvanwestbrabant/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "hartvanwestbrabant/style-webshop-hartvanwestbrabant.scss";
    task.watch = [
        "_common/**/*.scss",
        "hartvanwestbrabant/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5650, '/');

module.exports = platform;