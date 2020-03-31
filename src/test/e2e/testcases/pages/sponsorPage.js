
var sponsorPage = function(){
    this.get = function(){
        browser.get(environment.sponsorURL)
    }

    this.setActiveAccount = function(){
        browser.executeScript("window.localStorage.setItem('active_account','" + environment.active_account + "');").
        then(function(){
            browser.refresh();
        });
    };

    this.clearLocalStorage = function(){
        browser.executeScript("window.localStorage.clear()")
        .then(function(){
            browser.refresh();
        });
    }

    this.openLogin = function(){
        element(by.id("login")).click();
    }

    this.openStart = function(){
        element(by.css('[ng-click="$ctrl.openAuthCodePopup()"]')).click();
    }

    this.closeLoginModal = function(){
        element(by.id("close")).click();
    }

    this.getFaqBlock = function(){
        return element(by.id("faq"))
    }
}
module.exports = new sponsorPage();