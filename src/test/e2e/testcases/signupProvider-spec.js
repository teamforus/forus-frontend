
var signupProviderPage = require('./signupProviderPage');

describe('testing signup flow of provider:', function() {
    
    it('navigates to signup page', function(){
        signupProviderPage.get();

    });
    
    it('step 1', function() {
        signupProviderPage.alreadyHaveApp();
    });


    it('step 2', function() {
        signupProviderPage.enterPersonalDetails();
    });

    it('step 3', function() {
        signupProviderPage.enterOrganisationDetails();
    });

    it('step 4', function() {
        signupProviderPage.enterLocationDetails();
    });

    it('step 5', function() {
        signupProviderPage.connectMeApp();
    });

    it('step 6 and checks if organisation is set up correctly', function() {
        signupProviderPage.applyForFund(); 
        expect(signupProviderPage.getCompanyName().getText()).toEqual(environment.company);
        expect(signupProviderPage.getEmail().getText()).toEqual(environment.emailSibling);
    });


    afterAll(function(){
        browser.executeScript("return window.localStorage.getItem('active_account');").
            then(function(active_account){
                environment.active_account = active_account;
            });
    });
   
});
