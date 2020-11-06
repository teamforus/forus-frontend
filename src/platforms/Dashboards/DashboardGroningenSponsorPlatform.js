const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.groningen';

// change platform name
platform.setName('dashboard_groningen_sponsor');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-groningen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "groningen/style-dashboard-groningen.scss";
    task.watch = [
        "_common/**/*.scss",
        "groningen/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(3600, '/');

module.exports = platform;
