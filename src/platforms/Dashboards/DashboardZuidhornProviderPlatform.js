const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.zuidhorn';

// change platform name
platform.setName('dashboard_zuidhorn_provider');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

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
platform.serve(4010, '/');

module.exports = platform;