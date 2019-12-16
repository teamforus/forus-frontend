const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-general.panel';

// change platform name
platform.setName('webshop_general');

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

// change server port
platform.serve(5500, '/');

module.exports = platform;