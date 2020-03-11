var providerPage = function(){
    this.get = function(){
        browser.get(environment.providerURL)
    }

    this.getSignupProvider = function(){
        browser.get(environment.providerURL.concat('#!/sign-up'))
    }

    this.goToStep = function(step){
        browser.executeScript("window.localStorage.setItem('sign_up_form.step','" + step + "');").
        then((result) => {
            browser.refresh();
        }).catch((err) => {
            console.log(err)
        });
    }

    this.appIsInstalled = function(){
        element(by.className('checkbox checkbox-confirm')).click();
    }

    this.LoginWithMeButton = function(){
        element(by.css('[ng-click="$ctrl.showLoginQrCode()"]')).click();
    }

    this.getLoginQrCode = function(){
        return element(by.css('[qr-value="$ctrl.authToken"]'));
    }


    this.getGoToStep2Button = function(){
        return element(by.css('[ng-click="$ctrl.skipToStep(2)"]'))
    }

    this.openLogin = function(){
        element(by.css('[ng-click="openAuthPopup()"]')).click();
    }

    this.openStart = function(){
        element(by.css('[ng-click="$ctrl.openAuthCodePopup()"]')).click();
    }

    this.closeModal = function(){
        element(by.className('modal-close mdi mdi-close')).click();
    }

    this.getFlowBlock = function(){
        return element(by.className('section section-flow'))
    }

    this.getFaqBlock = function(){
        return element(by.className('section section-faq'))
    }
    
}
module.exports = new providerPage();