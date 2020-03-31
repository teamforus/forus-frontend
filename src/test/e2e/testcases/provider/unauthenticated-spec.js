var provider = require('../pages/providerPage');

describe('testing unauthenticated provider functionality:', function(){
    
    beforeAll(function(){
        provider.get()
        provider.clearLocalStorage()
    })

    beforeEach(function(){
        provider.get()
    }) 

    it('checks if components are loaded', function(){
        expect(provider.getFaqBlock().isPresent()).toBe(true)
        expect(provider.getFlowBlock().isPresent()).toBe(true)
    })

    it('opens and closes login modal', function(){
        browser.waitForAngular();
        provider.openLogin()
        browser.ignoreSynchronization = true;
        provider.closeLoginModal()
        browser.ignoreSynchronization = false;
    });
});