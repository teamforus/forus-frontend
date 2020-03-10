var provider = require('./providerPage');

describe('testing unauthenticated provider functionality:', function(){
    
    beforeEach(function(){
        webshop.get()
    }) 

    it('checks if components are loaded', function(){
        expect(provider.getFaqBlock().isPresent()).toBe(true)
        expect(provider.getFlowBlock().isPresent()).toBe(true)

    })

    it('opens and closes login modal', function(){
        browser.waitForAngular();
        provider.openLogin()
        browser.ignoreSynchronization = true;
        provider.closeModal()
        browser.ignoreSynchronization = false;
    });

});