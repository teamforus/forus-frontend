const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.westerkwartier';

// change platform name
platform.setName('dashboard_westerkwartier_sponsor');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-westerkwartier/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "westerkwartier/style-dashboard-westerkwartier.scss";
    task.watch = [
        "_common/**/*.scss",
        "westerkwartier/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(3540, '/');

module.exports = platform;