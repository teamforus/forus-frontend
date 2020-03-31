var provider = require('../pages/providerPage');

describe('testing provider signup functionality:', function(){
    
    beforeAll(function(){
        provider.getSignupProvider()
        provider.clearLocalStorage()
    })

    beforeEach(function(){
        provider.getSignupProvider()
    }) 

    it('step 1', function(){
        provider.appIsInstalled();
        browser.sleep(3000)
        expect(provider.getGoToStep2Button().isPresent()).toBe(true) 
    })
});