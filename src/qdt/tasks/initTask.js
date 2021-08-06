const fs = require('fs');
const path = require('path');
const { qdt_core, qdt_verbose, envFile, params } = require('../Lib');
const sourceAddTask = require('./sourceAddTask');

const initTask = (done) => {
    (new Promise(function(resolve) {
        resolve(fs.existsSync(envFile));
    })).then(function(exists) {
        return new Promise(function(resolve) {
            // environment configs not exists
            if (!exists) return resolve(null);

            // ask to override
            qdt_core.ask(qdt_verbose.task_init_env_exists, true).then(resolve);
        });
    }).then(function(resp) {
        if (resp === false) {
            return console.log(qdt_verbose.task_init_keep_env) && done();
        }

        if (resp === null) {
            console.log(qdt_verbose.task_init_gen_env);
        }

        if (resp === true) {
            console.log(qdt_verbose.task_init_override_env);
        }

        var sampleEnvFile = path.resolve(__dirname, '../../qdt-env.sample.js');

        if (!fs.existsSync(sampleEnvFile)) {
            sampleEnvFile = path.resolve(__dirname, '../../qdt-env.sample.json');
        }

        // create env config file
        fs.writeFileSync(path.resolve(__dirname, '../../qdt-env.js'), fs.readFileSync(sampleEnvFile));

        if (params != 'undefined' && typeof params.source != 'undefined') {
            sourceAddTask('source');
        }
    });

    done();
};

module.exports = initTask;