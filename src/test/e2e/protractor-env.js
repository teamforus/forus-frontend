

//generate random string for email
let r = Math.random().toString(36).substring(7);
        

var environment = {
    //browserstack environment
    browserstack_user : 'sjoerdhilhorst1',
    browserstack_key : 'CPnjuGmVNwZrvxyNg9yK',
    browserstack_local: true,
    enableBrowserstack : false,
    


    //email client
    email : "forusemail123@gmail.com",
    password : "Password@123!",
    
    
    //test environment
    browserName : "IE",
    customerURL : "http://localhost:5500",
    providerURL : "http://localhost:4000",
    sponsorURL :  "http://localhost:3500",
    active_account : "682620763695dbaf7ded91baf5b88837dfe0dca4bc8e0e501bcc09f0956c52208d86b2477f1ec2269fd089ec50ba5137e6457c15a4db003b1970f1b84b526a3ed0a22c226e9d6250230d850a36dadc7b030e23b3dc1ef383442069624888b92bed61bc3d",

    //providerURL : "https://staging.forus.io/provider",
    
    //input variables
    emailSibling : "forusemail123+".concat(r, "@gmail.com"),
    activationcode : "34e7-4f3e",
    iban : "NL60BUNQ2025316305",
    kvk : "90001354",
    phone : "0621372826",
    name : "test",
    company : "test",
    address : "9715AB"

}

module.exports = environment;