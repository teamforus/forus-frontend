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
        expect(provider.getGoToStep2Button().isPresent()).toBe(true)
        
    })

});