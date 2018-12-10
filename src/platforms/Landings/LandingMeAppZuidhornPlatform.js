const platform = require('./_LandingMeAppBasePlatform').clone();
const destPath = '../dist/forus-landing-meapp.zuidhorn';

// change platform name
platform.setName('landing_meapp_zuidhorn');

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
platform.serve(6510, '/');

module.exports = platform;