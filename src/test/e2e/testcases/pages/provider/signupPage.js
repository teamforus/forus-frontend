var SignupPage = function(){
    
    this.get = function(){
        browser.get(environment.providerURL + '#!/sign-up')
    }

    this.appIsInstalled = function(){
        element(by.id("has_app")).click();
    }

    this.getGoToStep2Button = function(){
        return element(by.id('go_step_2'))
    }
}
module.exports = new SignupPage()