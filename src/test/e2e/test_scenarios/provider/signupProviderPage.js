var signupProviderPage  = function(){

    this.get = function(){
        browser.driver.manage().window().maximize();
        browser.get(environment.providerURL.concat("/#!/sign-up")); //temporary solution
        //browser.get("https://staging.forus.io/provider/sign-up?tag=sdoa"); //temporary solution
    }

    this.alreadyHaveApp = function(){
        element(by.css('[translate="sign_up.download.already_have_app"]')).click();
        element(by.css('[ng-click="$ctrl.skipToStep(2)"]')).click();
    }

    this.enterPersonalDetails = function(){
        element(by.model('$ctrl.signUpForm.values.records.primary_email')).sendKeys(environment.emailSibling);
        element(by.model('$ctrl.signUpForm.values.records.primary_email_confirmation')).sendKeys(environment.emailSibling);
        element(by.model('$ctrl.signUpForm.values.records.given_name')).sendKeys(environment.name);
        element(by.model('$ctrl.signUpForm.values.records.family_name')).sendKeys(environment.name);
        element(by.id('next-2')).click();
    }

    this.enterOrganisationDetails = function(){
        element(by.model('$ctrl.organizationForm.values.name')).sendKeys(environment.company);
        element(by.model('$ctrl.organizationForm.values.iban')).sendKeys(environment.iban);
        element(by.model('$ctrl.organizationForm.values.iban_confirmation')).sendKeys(environment.iban);
        element(by.model('$ctrl.organizationForm.values.email')).sendKeys(environment.emailSibling);
        element(by.model('$ctrl.organizationForm.values.phone')).sendKeys(environment.phone);
        element(by.model('$ctrl.businessType')).click();
        
        //TODO: better element finder for organisation type
        element(by.css('[ng-click="$dir.select(option)"]')).click();
        
        element(by.model('$ctrl.organizationForm.values.kvk')).sendKeys(environment.kvk);
        var buttonNext = element(by.id('next-3'));
        buttonNext.click();
    }

    this.enterLocationDetails = function(){
        element(by.model('$ctrl.form.values.address')).sendKeys(environment.address);
        element(by.model('$ctrl.form.values.phone')).sendKeys(environment.phone);
        element(by.id("next-4")).click();
    }

    this.connectMeApp = function(){
        element(by.css('[translate="sign_up.buttons.skip"]')).click();
    }

    this.applyForFund = function(){
        element(by.css('[translate="sign_up.buttons.skip_to_dashboard"]')).click();

    }

    this.getCompanyName = function(){
        return element(by.binding("$ctrl.organization.name"));
    }
    this.getKVKnumber = function(){
        return element(by.className("{'text-muted':!$ctrl.organization.kvk}"));
    }
    this.getEmail = function(){
        return element(by.binding('$ctrl.organization.email'));

    }
}
module.exports = new signupProviderPage();