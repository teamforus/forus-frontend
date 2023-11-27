const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-goereeoverflakkee.panel';

// change platform name
platform.setName('webshop_goereeoverflakkee');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-goereeoverflakkee/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "goereeoverflakkee/style-webshop-goereeoverflakkee.scss";
    task.watch = [
        "_common/**/*.scss",
        "goereeoverflakkee/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5710, '/');

module.exports = platform;
