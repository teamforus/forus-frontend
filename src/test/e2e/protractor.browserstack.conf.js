var browserstack = require('browserstack-local');
const MailListener = require("./util/mailListener")
const environment = require("./protractor-env.js");

exports.config = {
    seleniumAddress: 'http://hub-cloud.browserstack.com/wd/hub',

    capabilities: {
        'browserstack.user': environment.browserstack.user,
        'browserstack.key': environment.browserstack.key,
        'browser_version': environment.browser.name.version,
        'browserstack.local': environment.browserstack.local,
        'browserName': environment.browser.name,
        'name': 'Bstack-[Protractor] Local Test',
        "resolution": [
            environment.browser.window.width, 
            environment.browser.window.height
        ].join('x'),
    },

    suites: {
        requester: ['testcases/requester/*-spec.js'],
        sponsor: ['testcases/sponsor/*-spec.js'],
        provider: ['testcases/provider/*-spec.js'],
    },

    beforeLaunch: function() {
        global.environment = environment;

        return new Promise(function(resolve, reject) {
            exports.bs_local = new browserstack.Local();
            exports.bs_local.start({
                'key': exports.config.capabilities['browserstack.key']
            }, function(error) {
                if (error) {
                    exports.bs_local.stop(resolve);
                    return reject(error);
                }
                resolve();
            });
        });
    },

    afterLaunch: function() {
        mailListener.stop();
        return new Promise(function(resolve, reject) {
            exports.bs_local.stop(resolve);
        });
    },
};