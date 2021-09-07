const { grouped_platforms } = require("../Library");
const assetsCompiler = require("../compilers/assetsCompiler");

const assetsTask = async (done) => {
    for (var k in grouped_platforms) {
        await assetsCompiler(k);
    }

    done();
};

module.exports = assetsTask;