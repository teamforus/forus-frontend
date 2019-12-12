const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.noordoostpolder';

// change platform name
platform.setName('dashboard_noordoostpolder_provider');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-noordoostpolder/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "noordoostpolder/style-dashboard-noordoostpolder.scss";
    task.watch = [
        "_common/**/*.scss",
        "noordoostpolder/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(4090, '/');

module.exports = platform;