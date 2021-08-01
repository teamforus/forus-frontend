const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-heumen.panel';

// change platform name
platform.setName('webshop_heumen');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-heumen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "heumen/style-webshop-heumen.scss";
    task.watch = [
        "_common/**/*.scss",
        "heumen/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5620, '/');

module.exports = platform;