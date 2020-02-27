const environment = require("./protractor-env.js");

exports.config = {

    
    specs: ['testcases/signupProvider.js'],

    capabilities: {
        'browserName': 'firefox',
        'name': 'Bstack-[Protractor] Local Test',
        
    },

    beforeLaunch: function(){


        var MailListener = require("mail-listener2");
        console.log(environment.email, environment.password)

        // here goes your email connection configuration
        var mailListener = new MailListener({
            username: environment.email,
            password: environment.password,
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

        global.mailListener = mailListener;
        global.environment = environment;
    }
  };