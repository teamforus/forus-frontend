
var webshopPage = function(){
    this.get = function(){
        browser.get(environment.sponsorURL)
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

    this.getFaqBlock = function(){
        return element(by.className('section section-faq'))
    }
}
module.exports = new webshopPage();