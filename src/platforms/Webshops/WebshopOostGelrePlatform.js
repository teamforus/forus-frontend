const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-oostgelre.panel';

// change platform name
platform.setName('webshop_oostgelre');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-oostgelre/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "oostgelre/style-webshop-oostgelre.scss";
    task.watch = [
        "_common/**/*.scss",
        "oostgelre/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5570, '/');

module.exports = platform;