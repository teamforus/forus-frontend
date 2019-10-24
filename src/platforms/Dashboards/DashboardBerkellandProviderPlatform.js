const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.berkelland';

// change platform name
platform.setName('dashboard_berkelland_provider');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-berkelland/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "berkelland/style-dashboard-berkelland.scss";
    task.watch = [
        "_common/**/*.scss",
        "berkelland/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(4060, '/');

module.exports = platform;