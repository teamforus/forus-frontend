const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.winterswijk';

// change platform name
platform.setName('dashboard_winterswijk_provider');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-winterswijk/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "winterswijk/style-dashboard-winterswijk.scss";
    task.watch = [
        "_common/**/*.scss",
        "winterswijk/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(4080, '/');

module.exports = platform;