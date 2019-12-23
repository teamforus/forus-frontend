const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.kerstpakket';

// change platform name
platform.setName('dashboard_kerstpakket_provider');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-kerstpakket/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "kerstpakket/style-dashboard-kerstpakket.scss";
    task.watch = [
        "_common/**/*.scss",
        "kerstpakket/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(4050, '/');

module.exports = platform;