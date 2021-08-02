const colors = require('colors');
const { qdt_verbose } = require("../lib");

const sourceRemoveTask = function(done) {
    if (params.length === 0 || typeof params.name == 'undefined') {
        return console.log(colors.red(qdt_verbose.source_remove_unk_name));
    }

    if (params.name == 'sample') {
        return console.log(colors.red(qdt_verbose.source_remove_sample_name));
    }

    fs.exists("./sources/" + params.name, function(exists) {
        if (!exists) {
            var message = qdt_verbose.source_remove_not_found_name.replace(
                '[name]', params.name
            );

            return console.log(colors.red(message));
        }

        del("./sources/" + params.name, {
            force: true
        }).then(res => {
            console.log(colors.green(qdt_verbose.source_remove_done.replace('[name]', params.name)));
        });
    });

    done();
};

module.exports = sourceRemoveTask;