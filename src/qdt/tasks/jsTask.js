const jsCompiler = require("../compilers/jsCompiler");
const { grouped_platforms } = require("../Library");

const _iif_js = async function(_k_js, platform, group) {
    const _path = 'sources/' + _k_js + '/js/';
    const _srv = [];
    const task = group;

    if (typeof group.src == "string") {
        group.src = [group.src];
    }

    for (var i = group.src.length - 1; i >= 0; i--) {
        _srv.push(_path + group.src[i]);
    }

    await jsCompiler(platform, _srv, task);
};

const jsTask = async (done) => {
    for (var k_js in grouped_platforms) {
        for (var _b = grouped_platforms[k_js].length - 1; _b >= 0; _b--) {
            const _js_s = grouped_platforms[k_js][_b].tasks.js;

            for (var _ba = _js_s.length - 1; _ba >= 0; _ba--) {
                await _iif_js(k_js, grouped_platforms[k_js][_b], grouped_platforms[k_js][_b].tasks.js[_ba]);
            }
        }
    }

    done();
};


module.exports = jsTask;