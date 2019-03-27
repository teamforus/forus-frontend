const platform = require('./_LandingMeAppBasePlatform').clone();
const destPath = '../dist/forus-landing-meapp.emmen';

// change platform name
platform.setName('landing_meapp_emmen');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-emmen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "emmen/style-dashboard-emmen.scss";
    task.watch = [
        "_common/**/*.scss",
        "emmen/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(6510, '/');

module.exports = platform;