const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../../lab.forus.io/zuidhorn';

// change platform name
platform.setName('webshop_zuidhorn');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-zuidhorn/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "zuidhorn/style-webshop-zuidhorn.scss";
    task.watch = [
        "_common/**/*.scss",
        "zuidhorn/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5510, '/');

module.exports = platform;