var providerPage = function(){
    this.get = function(){
        browser.get(environment.providerURL)
    }

    this.getSignupProvider = function(){
        browser.get(environment.providerURL + '#!/sign-up')
    }

    this.appIsInstalled = function(){
        element(by.id("has_app")).click();
    }

    this.getGoToStep2Button = function(){
        return element(by.id('go_step_2'))
    }

    this.openLogin = function(){
        element(by.id("login")).click();
    }

    this.closeLoginModal = function(){
        element(by.id('close')).click();
    }

    this.getFlowBlock = function(){
        return element(by.id("flow"))
    }

    this.getFaqBlock = function(){
        return element(by.id("faq"))
    } 
}
module.exports = new providerPage();