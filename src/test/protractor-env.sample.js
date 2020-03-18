//generate random string for email
let r = Math.random().toString(36).substring(7);
        

var environment = {
    //browserstack environment
    browserstack_user : 'your-browserstack-username',
    browserstack_key : 'your-browserstack-key',
    browserstack_local: true,

    //email client
    email : "your-email-client",
    password : "your-email-client-password",
    
    //test environment
    browserName : "chrome",
    customerURL : "http://localhost:5500",
    providerURL : "http://localhost:4000",
    sponsorURL :  "http://localhost:3500",
    active_account : "your session token",

    //input variables
    emailSibling : "your-email-client+".concat(r, "@gmail.com"),
    activationcode : "94e0-b1f6",
    iban : "NL60BUNQ2025316305",
    kvk : "90001354",
    phone : "0621372826",
    name : "test",
    company : "test",
    address : "9715AB"

}

module.exports = environment;