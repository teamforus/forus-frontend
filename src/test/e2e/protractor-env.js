

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
    active_account : "051d837d376b3943e84b01552517723e5fc0cf5cc69fe63cd402a693fd214132c9031eb1ec981b2bff5d66d8393832d5924fb3597fdaec32f449eeac5abae28cf09a5763ed8808f5e6f18bc1cae8285c2a4eb054f98534d65925e1522cf8af88702b709f",

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