var MailListener = require("mail-listener2");
const env = require("../protractor-env");

function mailListener(email, password) {
    const mailListener = new MailListener({
        username: env.email.user,
        password: env.email.pass,
        host: env.email.host,
        port: env.email.port,
        requireSSL: env.email.ssl,
        tls: env.email.tls,
        tlsOptions: {
            rejectUnauthorized: false
        },
        mailbox: env.email.mailbox || "INBOX", // mailbox to monitor 
        searchFilter: env.email.searchFilter || ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved 
        markSeen: env.email.markSeen || true, // all fetched email willbe marked as seen and not fetched next time 
        fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`, 
        mailParserOptions: {
            streamAttachments: true
        }, // options to be passed to mailParser lib. 
        attachments: true, // download attachments as they are encountered to the project directory 
        attachmentOptions: {
            directory: "attachments/"
        } // specify a download directory for attachments 
    });

    mailListener.start();

    mailListener.on("server:connected", function() {
        console.log("Mail listener initialized");
    });

    mailListener.on("error", function(err) {
        console.log(err);
    });

    return mailListener;
}

module.exports = mailListener;