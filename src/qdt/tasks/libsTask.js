const fse = require('fs-extra');
const path = require('path');
const { assetsSuffix, grouped_platforms, qdt_core } = require('../lib');
const { composeDestPath } = qdt_core;

const libsTask = (done) => {
    Object.values(grouped_platforms).forEach(platforms => {
        platforms.forEach((platform) => {
            const bundle = qdt_core.buildLibsBundle(platform.libs);
            const assestPath = (file) => path.resolve(__dirname, '../../', platform.paths.assets + file);

            while (bundle.js.indexOf("map/*") !== -1) {
                bundle.js = bundle.js.replace("map/*", "map\n/*");
            }

            fse.mkdirpSync(assestPath('/dist/bundle/js'));
            fse.writeFileSync(composeDestPath(
                assestPath('/dist/bundle/js/bundle.min.js'),
                !platform.env_data.disable_timestamps ? assetsSuffix : ''
            ), bundle.js);

            fse.mkdirpSync(assestPath('/dist/bundle/css'));
            fse.writeFileSync(composeDestPath(
                assestPath('/dist/bundle/css/bundle.min.css'),
                !platform.env_data.disable_timestamps ? assetsSuffix : ''
            ), bundle.css);

            fse.mkdirpSync(assestPath('/dist/bundle/fonts'));
            bundle.fonts.forEach(font => {
                fse.copyFileSync(
                    path.resolve(__dirname, '../../', font),
                    assestPath('/dist/bundle/fonts/' + path.parse(font).base)
                );
            });
        });
    });

    return done();
};

module.exports = libsTask;