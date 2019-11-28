const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.sponsor.oostgelre';

// change platform name
platform.setName('dashboard_oostgelre_sponsor');

// change building root path
platform.setDestRootPath(destPath);


// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-oostgelre/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "oostgelre/style-dashboard-oostgelre.scss";
    task.watch = [
        "_common/**/*.scss",
        "oostgelre/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(3570, '/');

module.exports = platform;