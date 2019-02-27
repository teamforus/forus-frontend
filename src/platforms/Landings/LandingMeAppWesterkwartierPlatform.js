const platform = require('./_LandingMeAppBasePlatform').clone();
const destPath = '../dist/forus-landing-meapp.westerkwartier';

// change platform name
platform.setName('landing_meapp_westerkwartier');

// tweaking output and cleaned paths config
platform.setDest(`${destPath}`);
platform.setAssetsPath(`${destPath}/assets`);
platform.setCleanPath([
    `${destPath}`,
    `${destPath}/assets`
]);

// assets configs
platform.copyAsset("resources/_platform-common/**/*", "./");
platform.copyAsset("resources/platform-westerkwartier/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "westerkwartier/style-dashboard-westerkwartier.scss";
    task.watch = [
        "_common/**/*.scss",
        "westerkwartier/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(6540, '/');

module.exports = platform;