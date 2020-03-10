var provider = require('./providerPage');

describe('testing provider signup functionality:', function(){
    
    beforeEach(function(){
        provider.getSignupProvider()
    }) 

    it('step 1', function(){
        expect(provider.getGoToStep2Button().isPresent()).toBe(true)
        //browser.sleep(30000)
    })

    it('opens and closes login modal', function(){
        browser.waitForAngular();
        provider.openLogin()
        browser.ignoreSynchronization = true;
        provider.closeModal()
        browser.ignoreSynchronization = false;
    });

});