const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-emmen.panel';

// change platform name
platform.setName('webshop_emmen');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-emmen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "emmen/style-webshop-emmen.scss";
    task.watch = [
        "_common/**/*.scss",
        "emmen/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5510, '/');

module.exports = platform;