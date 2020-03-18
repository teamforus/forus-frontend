var sponsor = require('../pages/sponsorPage');

describe('testing unauthenticated sponsor functionality', function(){
    
    beforeAll(function(){
        sponsor.get()
        sponsor.clearLocalStorage()
    })

    beforeEach(function(){
        sponsor.get()
    });

    it('opens and closes login modal', function(){
        sponsor.openLogin()
        browser.ignoreSynchronization = true;
        sponsor.closeModal()
        browser.ignoreSynchronization = false;
    });

    it('checks if blocks are present', function(){
        expect(sponsor.getFaqBlock().isDisplayed()).toBe(true)
    });



});