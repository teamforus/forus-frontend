const platform = require('./_DashboardBasePlatform').clone();
const destPath = '../dist/forus-platform.provider.general';

// change platform name
platform.setName('dashboard_general_provider');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

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