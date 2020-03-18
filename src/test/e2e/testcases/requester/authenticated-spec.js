var requester = require('../pages/requesterPage');


describe('testing basic authenticated functionality of requester:', function(){
    beforeAll(function(){
        requester.get()
        requester.setActiveAccount();
    });

    beforeEach(function(){
        requester.get()
    })

    it('opens and closes activation code modal', function(){
        requester.openUserMenu()
        requester.userMenuActivationCode()
        requester.closeModal()
    });

    it('opens and closes me-app login modal', function(){
        requester.openUserMenu()
        requester.userMenuLoginApp()
        requester.closeModal()
    })

    it('navigates to my vouchers', function(){
        requester.getVouchersPage()
        //browser.sleep(3000)
        expect(requester.getVouchersComponent().isDisplayed()).toBe(true)  
    })
    
    it('navigates to notification preferences, and checks if enable and disable buttons work', function(){
        requester.openUserMenu()
        requester.userMenuNotificationPreferences()
        
        //check which button is present
        requester.enableMailSubscription().isPresent().then(function(result) {
            if ( result ) { //check if other button is present when clicking
                requester.enableMailSubscription().click()
                expect(requester.disableMailSubscription().isDisplayed()).toBe(true)
            } else {
                requester.disableMailSubscription().click()
                expect(requester.enableMailSubscription().isDisplayed()).toBe(true)
            }
        });
    })

    it('logs out', function(){
        requester.openUserMenu()
        //requester.userMenuSignOut() // active_account token expires !!!
    });
});