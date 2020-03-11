var sponsor = require('./sponsorPage');

describe('testing unauthenticated sponsor functionality', function(){
    
    it('navigates to page', function(){
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