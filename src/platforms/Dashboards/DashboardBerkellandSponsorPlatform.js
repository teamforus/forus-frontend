const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.berkelland';

// change platform name
platform.setName('dashboard_berkelland_sponsor');

// change building root path
platform.setDestRootPath(destPath);

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

    return task;
});

// change server port
platform.serve(3560, '/');

module.exports = platform;