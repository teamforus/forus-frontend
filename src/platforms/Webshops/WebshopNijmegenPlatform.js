const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-nijmegen.panel';

// change platform name
platform.setName('webshop_nijmegen');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-nijmegen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "nijmegen/style-webshop-nijmegen.scss";
    task.watch = [
        "_common/**/*.scss",
        "nijmegen/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5520, '/');

module.exports = platform;