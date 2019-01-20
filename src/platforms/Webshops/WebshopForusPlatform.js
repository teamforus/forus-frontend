const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-forus.panel';

// change platform name
platform.setName('webshop_forus');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-forus/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "forus/style-webshop-forus.scss";
    task.watch = [
        "_common/**/*.scss",
        "forus/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5530, '/');

module.exports = platform;