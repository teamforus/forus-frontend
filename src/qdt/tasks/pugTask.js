const pugCompiler = require("../compilers/pugCompiler");
const { grouped_platforms } = require("../Library");

const _iif_pug = async function(_k_pug, platform, task) {
    var _raw_src = [];
    var _path = 'sources/' + _k_pug + '/pug/';

    for (var i = task.src.length - 1; i >= 0; i--) {
        _raw_src.push(_path + task.src[i]);
    }

    await pugCompiler(__dirname + '/../../' + _path + '/' + task.path, platform, _raw_src, task.dest, task);
};


const pugTask = async (done) => {
    for (var k_pug in grouped_platforms) {
        for (var i = grouped_platforms[k_pug].length - 1; i >= 0; i--) {
            const _pug_s = grouped_platforms[k_pug][i].tasks.pug;

            for (var j = _pug_s.length - 1; j >= 0; j--) {
                await _iif_pug(k_pug, grouped_platforms[k_pug][i], grouped_platforms[k_pug][i].tasks.pug[j]);
            }
        }
    }

    done();
};

module.exports = pugTask;