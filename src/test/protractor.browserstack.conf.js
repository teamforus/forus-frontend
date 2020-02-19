var browserstack = require('browserstack-local');
var MailListerner = require('mail-listener2');


exports.config = {
    'seleniumAddress': 'http://hub-cloud.browserstack.com/wd/hub',

    //specs: ['testcase_1.js'],

    capabilities: {
        'browserstack.user': 'sjoerdhilhorst1',
        'browserstack.key': 'AZgvLqjzR78nsGTF3Av7',
        'browserstack.local': true,
        'browserName': 'chrome',
        'name': 'Bstack-[Protractor] Local Test'
    },



    
    // Code to start browserstack and maillistener local before start of test
    beforeLaunch: function(){
        var MailListener = require("mail-listener2");

        // here goes your email connection configuration
        var mailListener = new MailListener({
            username: "forusemail123@gmail.com",
            password: "Password@123!",
            host: "imap.gmail.com",
            //requireSSL: true,
            port: 993, // imap port 
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            mailbox: "INBOX", // mailbox to monitor 
            searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved 
            markSeen: true, // all fetched email willbe marked as seen and not fetched next time 
            fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`, 
            mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib. 
            attachments: true, // download attachments as they are encountered to the project directory 
            attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments 
        });

        mailListener.start();

        mailListener.on("server:connected", function(){
            console.log("Mail listener initialized");
        });

        mailListener.on("error", function(err){
            console.log(err);
          });
        //url = "http://localhost:5560/#!/"
        url = "https://berkelland.staging.forus.io/";
        
        global.url = url;
        global.mailListener = mailListener;
        
        console.log("Connecting local");
        return new Promise(function(resolve, reject){
        
            exports.bs_local = new browserstack.Local();
        
            exports.bs_local.start({'key': exports.config.capabilities['browserstack.key'] }, function(error) {
                if (error){
                    exports.bs_local.stop(resolve);
                    return reject(error);
                } 
            console.log('Connected. Now testing...');
            resolve();
            });
        });

    },

    // Code to stop browserstack local after end of test
    afterLaunch: function(){
        mailListener.stop();

        return new Promise(function(resolve, reject){
            exports.bs_local.stop(resolve);
       });
       
    }

};





