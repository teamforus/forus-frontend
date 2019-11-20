const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-westerkwartier.panel';

// change platform name
platform.setName('webshop_westerkwartier');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-westerkwartier/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "westerkwartier/style-webshop-westerkwartier.scss";
    task.watch = [
        "_common/**/*.scss",
        "westerkwartier/**/*.scss"
    ];

    return task
});

// change server port
platform.serve(5540, '/');

module.exports = platform;