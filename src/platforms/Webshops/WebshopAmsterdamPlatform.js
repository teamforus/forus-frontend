const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-amsterdam.panel';

// change platform name
platform.setName('webshop_amsterdam');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-amsterdam/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "Amsterdam/style-webshop-amsterdam.scss";
    task.watch = [
        "_common/**/*.scss",
        "amsterdam/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5650, '/');

module.exports = platform;