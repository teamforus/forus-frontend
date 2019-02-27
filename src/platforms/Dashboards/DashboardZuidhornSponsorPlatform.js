const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.zuidhorn';

// change platform name
platform.setName('dashboard_zuidhorn_sponsor');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-zuidhorn/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "zuidhorn/style-dashboard-zuidhorn.scss";
    task.watch = [
        "_common/**/*.scss",
        "zuidhorn/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(3510, '/');

module.exports = platform;