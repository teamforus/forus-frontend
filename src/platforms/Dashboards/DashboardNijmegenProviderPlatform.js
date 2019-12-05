const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.nijmegen';

// change platform name
platform.setName('dashboard_nijmegen_provider');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-nijmegen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "nijmegen/style-dashboard-nijmegen.scss";
    task.watch = [
        "_common/**/*.scss",
        "nijmegen/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(4020, '/');

module.exports = platform;