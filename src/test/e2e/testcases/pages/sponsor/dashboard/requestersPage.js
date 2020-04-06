var RequestersPage = function(){
    
    this.generateActivationCode = function(){
        element(by.id('add_single_prevalidation')).click()
    }

    this.closeGenerateActivationCode = function(){
        element(by.id('close')).click()
    }
}
module.exports = new RequestersPage();