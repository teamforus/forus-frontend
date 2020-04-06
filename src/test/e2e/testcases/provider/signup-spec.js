var provider = require('../pages/provider/providerPage');
var utils = require('../pages/utils')

describe('testing provider signup functionality:', function(){
    
    beforeAll(function(){
        provider.getSignupProvider()
        utils.clearLocalStorage()
    })

    beforeEach(function(){
        provider.getSignupProvider()
    }) 

    it('step 1', function(){
        provider.appIsInstalled();
        expect(provider.getGoToStep2Button().isPresent()).toBe(true) 
    })
});