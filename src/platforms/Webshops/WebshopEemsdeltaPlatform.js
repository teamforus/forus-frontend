const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-eemsdelta.panel';

// change platform name
platform.setName('webshop_eemsdelta');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-eemsdelta/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "eemsdelta/style-webshop-eemsdelta.scss";
    task.watch = [
        "_common/**/*.scss",
        "eemsdelta/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5680, '/');

module.exports = platform;