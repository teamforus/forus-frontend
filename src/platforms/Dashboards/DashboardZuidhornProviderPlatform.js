const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.zuidhorn';

// change platform name
platform.setName('dashboard_zuidhorn_provider');

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

    return task;
});

// change server port
platform.serve(4010, '/');

module.exports = platform;