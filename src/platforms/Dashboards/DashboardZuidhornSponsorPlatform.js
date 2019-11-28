const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.zuidhorn';

// change platform name
platform.setName('dashboard_zuidhorn_sponsor');

// change building root path
platform.setDestRootPath(destPath);

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