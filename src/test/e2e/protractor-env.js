

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
    active_account : "3edd42f46d274b6eac10a6226eba7f4cd531b63fe85b3bd0ad545516e9c65be92f9b461cb4b0fe058afd830a897452e768bc7684ddd02ca49c914056c1c8e9e6085ba2ab26e35bdf8b9c782a3a7163bce2ff1ac78a684df06c905aee4792f9ad5ee6afd2",

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