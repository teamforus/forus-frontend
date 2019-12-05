const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.noordoostpolder';

// change platform name
platform.setName('dashboard_noordoostpolder_sponsor');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-noordoostpolder/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "noordoostpolder/style-dashboard-noordoostpolder.scss";
    task.watch = [
        "_common/**/*.scss",
        "noordoostpolder/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(3590, '/');

module.exports = platform;