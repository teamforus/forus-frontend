const del = require('del');
const { qdt_c } = require("../lib");

const clearTask = (done) => {
    const paths = Object.values(qdt_c.platforms).map((platform) => {
        if (!platform.enabled || !platform.paths.clean) {
            return [];
        }

        if (typeof platform.paths.clean == 'string') {
            return [platform.paths.clean];
        }

        return platform.paths.clean;
    }).reduce((arr, value) => arr.concat(value), []);

    del(paths, { force: true }).then(() => done());
};

module.exports = clearTask;