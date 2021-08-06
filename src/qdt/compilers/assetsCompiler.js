const gulp = require('gulp');
const { makeNotifier, grouped_platforms, qdt_core } = require('../Lib');
const streamCombiner = require('stream-combiner');

const assetsCompiler = async function(source) {
    const chain = [];
    const onError = makeNotifier('Assets');
    const groupedPlatforms = grouped_platforms[source].filter(item => item);

    if (groupedPlatforms.length === 0)
        return false;

    groupedPlatforms.map(function(item) {
        const list_assets = qdt_core.qdtBuidAssetPaths(item);

        for (var i = list_assets.length - 1; i >= 0; i--) {
            const { from, to } = list_assets[i];

            chain.push(() => new Promise((resolve) => {
                streamCombiner(gulp.src(from), gulp.dest(to)).on('error', (val) => {
                    resolve();
                    onError(val);
                }).on('end', resolve);
            }));
        }
    });

    while (chain.length > 0) {
        await chain.pop()();
    }
};

module.exports = assetsCompiler;