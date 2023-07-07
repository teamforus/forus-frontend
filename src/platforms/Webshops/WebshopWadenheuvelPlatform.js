const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-wadenheuvel.panel';

// change platform name
platform.setName('webshop_wadenheuvel');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-wadenheuvel/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "wadenheuvel/style-webshop-wadenheuvel.scss";
    task.watch = [
        "_common/**/*.scss",
        "wadenheuvel/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5630, '/');

module.exports = platform;