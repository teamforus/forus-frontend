

//generate random string for email
let r = Math.random().toString(36).substring(7);
        

var environment = {
    //browserstack environment
    browserstack_user : 'sjoerdhilhorst1',
    browserstack_key : 'AZgvLqjzR78nsGTF3Av7',
    browserstack_local: true,
    enableBrowserstack : false,
    


    //email client
    email : "forusemail123@gmail.com",
    password : "Password@123!",
    
    
    //test environment
    browserName : "chrome",
    customerURL : "http://localhost:5560",
    providerURL : "http://localhost:4060",
    active_account : "dde98161e073a58efb240f5f50182964bd34232836cc1c0eaee410aa0887d4318f987a0d9eb18f366d29549cd25bcf49dc46afb47cc6a7cb7b0d6d5a575ec4e7563c1b7b29db17db8a06284ac1d77257cbd035d21d3d98fcf8b41b0f0b0eea144b12bb82",
    
    //providerURL : "https://staging.forus.io/provider",
    
    //input variables
    emailSibling : "forusemail123+".concat(r, "@gmail.com"),
    activationcode : "94e0-b1f6",
    iban : "NL60BUNQ2025316305",
    kvk : "90001354",
    phone : "0621372826",
    name : "test",
    company : "test",
    address : "9715AB"

}

module.exports = environment;