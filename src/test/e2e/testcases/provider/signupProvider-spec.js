var provider = require('./providerPage');

describe('testing provider signup functionality:', function(){
    
    beforeEach(function(){
        provider.getSignupProvider()
    }) 

    it('step 1', function(){
       // browser.sleep(10000)
        provider.appIsInstalled();
        expect(provider.getGoToStep2Button().isDisplayed()).toBe(true)
        
    })

    it('step 2, check if qr code shows', function(){

    })


});