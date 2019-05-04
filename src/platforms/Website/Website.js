const platform = require('./_Website').clone();
const destPath = '../dist/website';

// change platform name
platform.setName('website');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-general/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "general/website/style.scss";
    task.watch = [
        "general/website/includes/**/*.scss",
    ];

    return task
});

// change server port
platform.serve(6500, '/');

module.exports = platform;