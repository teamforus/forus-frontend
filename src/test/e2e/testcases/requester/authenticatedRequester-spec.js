var webshop = require('./webshopPage');
var EC = protractor.ExpectedConditions;
var customMatchers = {
    or : function(){
        return {
            
        }
    }
}

describe('testing basic authenticated functionality of requester:', function(){
    beforeAll(function(){
        webshop.get()
        webshop.setActiveAccount();
    });

    beforeEach(function(){
        webshop.get()
    })

    it('opens and closes activation code modal', function(){
        webshop.openUserMenu()
        webshop.userMenuActivationCode()
        webshop.closeModal()
    });

    it('opens and closes me-app login modal', function(){
        webshop.openUserMenu()
        webshop.userMenuLoginApp()
        webshop.closeModal()
    })

    it('navigates to my vouchers', function(){
        webshop.getVouchersPage()
        //browser.sleep(3000)
        expect(webshop.getVouchersComponent().isDisplayed()).toBe(true)  
    })
    
    it('navigates to notification preferences, and checks if enable and disable buttons work', function(){
        webshop.openUserMenu()
        webshop.userMenuNotificationPreferences()
        
        //check which button is present
        webshop.enableMailSubscription().isPresent().then(function(result) {
            if ( result ) { //check if other button is present when clicking
                webshop.enableMailSubscription().click()
                expect(webshop.disableMailSubscription().isDisplayed()).toBe(true)
            } else {
                webshop.disableMailSubscription().click()
                expect(webshop.enableMailSubscription().isDisplayed()).toBe(true)
            }
        });
    })

    it('logs out', function(){
        webshop.openUserMenu()
        //webshop.userMenuSignOut() // active_account token expires !!!
    });
});