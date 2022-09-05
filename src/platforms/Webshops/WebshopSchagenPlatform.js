const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-schagen.panel';

// change platform name
platform.setName('webshop_schagen');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-schagen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "schagen/style-webshop-schagen.scss";
    task.watch = [
        "_common/**/*.scss",
        "schagen/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5640, '/');

module.exports = platform;