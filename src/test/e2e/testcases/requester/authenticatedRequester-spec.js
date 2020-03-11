var webshop = require('./webshopPage');
var EC = protractor.ExpectedConditions;


describe('testing basic functionality:', function(){
    beforeAll(function(){
        webshop.get()
        webshop.setActiveAccount();
    });

    beforeEach(function(){
        webshop.get()
    })

    /*

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
    */
    it('navigates to notification preferences, and checks if enable and disable buttons work', function(){
        webshop.openUserMenu()
        webshop.userMenuNotificationPreferences()
        //webshop.disableMailSubscription().click()
        //console.log(webshop.enableMailSubscription().isPresent())
        //console.log(webshop.disableMailSubscription().isPresent())
        expect(EC.or(webshop.disableMailSubscription().isPresent(), webshop.enableMailSubscription().isPresent())).toBe(true)
    })

    it('logs out', function(){
        webshop.openUserMenu()
        //webshop.userMenuSignOut() // active_account token expires !!!
    });
});