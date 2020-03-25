const environment = {
    //browserstack environment
    browserstack_user : 'your-browserstack-username',
    browserstack_key : 'your-browserstack-key',
    browserstack_local: true,
    bs_browser_version: '11.0.0',

    //email client
    email : "your-email-client",
    password : "your-email-client-password",
    
    //test environment
    browser_name : "chrome",
    customerURL : "http://localhost:5500",
    providerURL : "http://localhost:4000",
    sponsorURL :  "http://localhost:3500",
    active_account : "your session token",
}
module.exports = environment;