

describe('testing signup flow of provider:', function() {
    //browser.driver.manage().window().maximize();

    browser.get(environment.providerURL.concat("/#!/sign-up")); //temporary solution
    //browser.get("https://staging.forus.io/provider/sign-up?tag=sdoa"); //temporary solution
    //browser.waitForAngular()
    
    it('step 1', function() {
        element(by.className('checkbox checkbox-confirm')).click();
        element(by.css('[ng-click="$ctrl.skipToStep(2)"]')).click();
    });

    it('step 2', function() {
        makeProfile();
    });

    it('step 3', function() {
      makeOrganisation();
    });

    it('step 4', function() {
        addLocation();
    });

    it('step 5', function() {
        addApp();
    });

    it('step 6', function() {
        applyForFund();
    });
});

//step 2
function makeProfile(){
    element(by.model('$ctrl.signUpForm.values.records.primary_email')).sendKeys(environment.emailSibling);
    element(by.model('$ctrl.signUpForm.values.records.primary_email_confirmation')).sendKeys(environment.emailSibling);
    element(by.model('$ctrl.signUpForm.values.records.given_name')).sendKeys(environment.name);
    element(by.model('$ctrl.signUpForm.values.records.family_name')).sendKeys(environment.name);
    element(by.id('next-2')).click();
}

//step 3
function makeOrganisation(){ 
    //var buttonNext = element(by.model('$ctrl.organizationForm.values.kvk'));
    
    //browser.actions().mouseMove(buttonNext).perform();
    element(by.model('$ctrl.organizationForm.values.name')).sendKeys(environment.company);
    element(by.model('$ctrl.organizationForm.values.iban')).sendKeys(environment.iban);
    element(by.model('$ctrl.organizationForm.values.iban_confirmation')).sendKeys(environment.iban);
    element(by.model('$ctrl.organizationForm.values.email')).sendKeys(environment.emailSibling);
    element(by.model('$ctrl.organizationForm.values.phone')).sendKeys(environment.phone);
    element(by.model('$ctrl.businessType')).click();
    element(by.css('[ng-click="$dir.select(option)"]')).click();
    
    element(by.model('$ctrl.organizationForm.values.kvk')).sendKeys(environment.kvk);

    var buttonNext = element(by.id('next-3'));
    //browser.executeScript("arguments[0].scrollIntoView();",buttonNext.getWebElement());
    //browser.wait(ExpectedConditions.visibilityOf((buttonNext)), 3000, 'error workt niet');

    //expect(buttonNext.isPresent()).toBeTruthy();

    //browser.switchTo().frame(buttonNext);

    //browser.sleep(100000) 
    
    //buttonBack.click();
    //browser.sleep(3000)
    buttonNext.click();
    
}

//step 4 
function addLocation(){
    element(by.model('$ctrl.form.values.address')).sendKeys(environment.address);
    element(by.model('$ctrl.form.values.phone')).sendKeys(environment.phone);
    element(by.id("next-4")).click();
}

//step 5
function addApp(){
    //skip this step for now
    element(by.css('[translate="sign_up.buttons.skip"]')).click();
}

//step 6 
function applyForFund(){
    element(by.css('[translate="sign_up.buttons.skip_to_dashboard"]')).click();
}