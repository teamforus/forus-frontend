const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-barneveld.panel';

// change platform name
platform.setName('webshop_barneveld');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-barneveld/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "barneveld/style-webshop-barneveld.scss";
    task.watch = [
        "_common/**/*.scss",
        "barneveld/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5550, '/');

module.exports = platform;