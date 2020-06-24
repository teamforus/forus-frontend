const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-potjeswijzer.panel';

// change platform name
platform.setName('webshop_potjeswijzer');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-potjeswijzer/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "potjeswijzer/style-webshop-potjeswijzer.scss";
    task.watch = [
        "_common/**/*.scss",
        "potjeswijzer/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5510, '/');

module.exports = platform;