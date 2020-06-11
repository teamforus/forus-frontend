const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.winterswijk';

// change platform name
platform.setName('dashboard_winterswijk_sponsor');

// change building root path
platform.setDestRootPath(destPath);

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

    return task;
});

// change server port
platform.serve(3580, '/');

module.exports = platform;