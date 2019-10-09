const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.oostgelre';

// change platform name
platform.setName('dashboard_oostgelre_provider');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-oostgelre/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "oostgelre/style-dashboard-oostgelre.scss";
    task.watch = [
        "_common/**/*.scss",
        "oostgelre/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(4070, '/');

module.exports = platform;