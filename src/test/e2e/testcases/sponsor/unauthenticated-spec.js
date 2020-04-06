var sponsor = require('../pages/sponsor/sponsorPage');
var utils = require('../pages/utils')

describe('testing unauthenticated sponsor functionality', function(){
    beforeAll(function(){
        sponsor.get()
        utils.clearLocalStorage()
    })

    beforeEach(function(){
        sponsor.get()
    });

    it('opens and closes login modal', function(){
        sponsor.openLogin()
        browser.ignoreSynchronization = true;
        sponsor.closeLoginModal()
        browser.ignoreSynchronization = false;
    });

    it('checks if blocks are present', function(){
        expect(sponsor.getFaqBlock().isDisplayed()).toBe(true)
    });
});