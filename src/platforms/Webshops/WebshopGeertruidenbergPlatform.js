const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-geertruidenberg.panel';

// change platform name
platform.setName('webshop_geertruidenberg');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-geertruidenberg/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "geertruidenberg/style-webshop-geertruidenberg.scss";
    task.watch = [
        "_common/**/*.scss",
        "geertruidenberg/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5600, '/');

module.exports = platform;