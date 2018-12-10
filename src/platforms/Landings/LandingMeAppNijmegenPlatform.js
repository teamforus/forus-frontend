const platform = require('./_LandingMeAppBasePlatform').clone();
const destPath = '../dist/forus-landing-meapp.nijmegen';

// change platform name
platform.setName('landing_meapp_nijmegen');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

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
platform.serve(6520, '/');

module.exports = platform;