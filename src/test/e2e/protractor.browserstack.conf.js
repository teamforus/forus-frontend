var browserstack = require('browserstack-local');
const MailListener = require("./util/mailListener")
const environment = require("./protractor-env.js");



exports.config = {
    'seleniumAddress': 'http://hub-cloud.browserstack.com/wd/hub',

    capabilities: {
        'browserstack.user': environment.browserstack_user,
        'browserstack.key': environment.browserstack_key,
        'browser_version' : environment.bs_browser_version,
        'browserstack.local': environment.browserstack_local,
        'browserName': environment.browserName,
        'name': 'Bstack-[Protractor] Local Test',
        "resolution" : "1920x1080"

    },

    suites: {
        requester : ['testcases/requester/*-spec.js'],
        sponsor : ['testcases/sponsor/*-spec.js'],
        provider : ['testcases/provider/*-spec.js'],
    },

    
    beforeLaunch: function(){
        global.environment = environment;
        global.mailListener = MailListener();
        
        return new Promise(function(resolve, reject){    
            exports.bs_local = new browserstack.Local();
            exports.bs_local.start({'key': exports.config.capabilities['browserstack.key'] }, function(error) {
                if (error){
                    exports.bs_local.stop(resolve);
                    return reject(error);
                } 
            resolve();
            });
        });
    },

    afterLaunch: function(){
        mailListener.stop();
        return new Promise(function(resolve, reject){
            exports.bs_local.stop(resolve);
       });   
    },
};








