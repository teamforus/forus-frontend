const platform = require('./_BackendBasePlatform').clone();
const destPath = '../dist/forus-backend.general';

// change platform name
platform.setName('backend_general');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "style.scss";
    task.watch = [
        "**/*.scss"
    ];

    return task;
});

module.exports = platform;