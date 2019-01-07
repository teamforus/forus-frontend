const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.nijmegen';

// change platform name
platform.setName('dashboard_nijmegen_sponsor');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-nijmegen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "nijmegen/style-dashboard-nijmegen.scss";
    task.watch = [
        "_common/**/*.scss",
        "nijmegen/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(3520, '/');

module.exports = platform;