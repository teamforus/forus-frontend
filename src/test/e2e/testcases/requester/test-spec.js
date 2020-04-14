var page = require('../pages/provider/providerPage')

describe('testing basic requester functionality', function(){ 
    beforeAll(function(){
        browser.get(environment.providerURL)
        //browser.waitForAngularEnabled(false)
    })
     
    beforeEach(function(){
        page.get()
    })
    it('should be working', function(){
        page.openLogin()
    })
});