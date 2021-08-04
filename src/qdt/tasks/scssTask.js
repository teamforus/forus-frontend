const scssCompiler = require("../compilers/scssCompiler");
const { grouped_platforms } = require("../lib");

const _iif_scss = async function(_k_scss, platform, group) {
    const _path = 'sources/' + _k_scss + '/scss/';

    if (typeof group.src == 'string') {
        group.src = [group.src];
    }

    if (group.src.length > 0) {
        await scssCompiler(platform, group.src.map((src) => _path + src), group);
    }
};

const scssTask = async function(done) {
    for (var k_scss in grouped_platforms) {
        for (var _a = grouped_platforms[k_scss].length - 1; _a >= 0; _a--) {
            const _scss_s = grouped_platforms[k_scss][_a].tasks.scss;

            for (var _aa = _scss_s.length - 1; _aa >= 0; _aa--) {
                await _iif_scss(k_scss, grouped_platforms[k_scss][_a], grouped_platforms[k_scss][_a].tasks.scss[_aa]);
            }
        }
    }

    done();
};

module.exports = scssTask;