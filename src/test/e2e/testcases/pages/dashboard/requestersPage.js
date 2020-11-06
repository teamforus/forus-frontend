var EC = protractor.ExpectedConditions;

var RequestersPage = function(){
    
    this.generateActivationCode = function(){
        element(by.id('add_single_prevalidation')).click()
    }

    this.closeGenerateActivationCode = function(){
        browser.wait(EC.elementToBeClickable(element(by.id("close"))), 3000)
        element(by.id('close')).click()
    }
}
module.exports = new RequestersPage();