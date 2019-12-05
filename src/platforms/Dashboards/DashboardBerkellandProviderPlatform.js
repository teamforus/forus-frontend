const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.berkelland';

// change platform name
platform.setName('dashboard_berkelland_provider');

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

    return task
});

// change server port
platform.serve(4060, '/');

module.exports = platform;