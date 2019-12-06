const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.general';

// change platform name
platform.setName('dashboard_general_provider');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-general/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "general/style-dashboard-general.scss";
    task.watch = [
        "_common/**/*.scss",
        "general/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(4000, '/');

module.exports = platform;