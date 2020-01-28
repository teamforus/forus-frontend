

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
    active_account : "35767c1fb486bca4350a9bd885de76b6fe76298ddad4e5e23cf90fc5028f51bf8f725e90221458e6f6dcb18937260a167190fdc145e89d3bc09114507e3cb1e17cda0bfcb5c57fba3aed6cf60e01656c9988abdba2b356fc658dce7e2cc1b3ad68eed7cb",

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