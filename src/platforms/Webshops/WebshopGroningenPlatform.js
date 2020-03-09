const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-groningen.panel';

// change platform name
platform.setName('webshop_groningen');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-groningen/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "groningen/style-webshop-groningen.scss";
    task.watch = [
        "_common/**/*.scss",
        "groningen/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5550, '/');

module.exports = platform;
