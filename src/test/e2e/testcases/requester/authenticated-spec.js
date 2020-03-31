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
        requester.closeActivationCodeModal()
    });

    it('opens and closes me-app login modal', function(){
        requester.openUserMenu()
        requester.userMenuLoginApp()
        requester.closePinCodeModal()
    })

    it('navigates to my vouchers', function(){
        requester.getVouchersPage()
        expect(requester.getVouchersComponent().isPresent()).toBe(true)  
    })
    
    it('navigates to notification preferences, and checks if enable and disable buttons work', function(){
        requester.openUserMenu()
        requester.userMenuNotificationPreferences()

        for(i=0;i<2;i++){
            //check which button is present
            requester.enableMailSubscription().isPresent().then(function(result) {
                if ( result ) { //check if other button is present when clicking
                    requester.enableMailSubscription().click()
                    expect(requester.disableMailSubscription().isPresent()).toBe(true)
                } else {
                    requester.disableMailSubscription().click()
                    expect(requester.enableMailSubscription().isPresent()).toBe(true)
                }
            });
        }
    })

    it('checks if log out item is present', function(){
        requester.openUserMenu()
        expect(requester.getUserMenuSignOut().isPresent()).toBe(true)
    });
});