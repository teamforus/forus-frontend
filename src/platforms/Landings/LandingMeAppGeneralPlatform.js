const platform = require('./_LandingMeAppBasePlatform').clone();
const destPath = '../dist/forus-landing-meapp.general';

// change platform name
platform.setName('landing_meapp_general');

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
platform.serve(6500, '/');

module.exports = platform;