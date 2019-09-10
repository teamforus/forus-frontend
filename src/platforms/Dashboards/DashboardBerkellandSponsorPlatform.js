const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.berkelland';

// change platform name
platform.setName('dashboard_berkelland_sponsor');

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
platform.serve(3560, '/');

module.exports = platform;