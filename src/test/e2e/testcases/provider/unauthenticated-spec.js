var provider = require('../pages/provider/providerPage');
var utils = require('../pages/utils')


describe('testing unauthenticated provider functionality:', function(){
    
    beforeAll(function(){
        provider.get()
        utils.clearLocalStorage()
    })

    beforeEach(function(){
        provider.get()
    }) 

    it('checks if components are loaded', function(){
        expect(provider.getFaqBlock().isPresent()).toBe(true)
        expect(provider.getFlowBlock().isPresent()).toBe(true)
    })

    it('should open and close login modal', function(){
        browser.waitForAngular();
        provider.openLogin()
        browser.ignoreSynchronization = true;
        provider.closeLoginModal()
        browser.ignoreSynchronization = false;
    });
});