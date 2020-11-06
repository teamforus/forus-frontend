const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-kerstpakket.panel';

// change platform name
platform.setName('webshop_kerstpakket');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-kerstpakket/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "kerstpakket/style-webshop-kerstpakket.scss";
    task.watch = [
        "_common/**/*.scss",
        "kerstpakket/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5530, '/');

module.exports = platform;