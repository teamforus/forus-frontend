const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-participatiemunt.panel';

// change platform name
platform.setName('webshop_participatiemunt');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-participatiemunt/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "participatiemunt/style-webshop-participatiemunt.scss";
    task.watch = [
        "_common/**/*.scss",
        "participatiemunt/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5660, '/');

module.exports = platform;