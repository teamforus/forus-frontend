var requester = require('../pages/requesterPage');

describe('testing basic requester functionality:', function(){

    beforeAll(function(){
        requester.get()
        requester.clearLocalStorage()
    })
    
    beforeEach(function(){
        requester.get()
    })

    it('checks if components are loaded', function(){
        expect(requester.getProductsBlock().isDisplayed()).toBe(true)
        expect(requester.getMapBlock().isDisplayed()).toBe(true)
        expect(requester.getStepsBlock().isDisplayed()).toBe(true)
        expect(requester.getFaqBlock().isDisplayed()).toBe(true)

    })

    it('opens and closes login modal', function(){
        browser.waitForAngular();
        requester.openLogin()
        browser.ignoreSynchronization = true;
        requester.closeModal()
        browser.ignoreSynchronization = false;
    });

    it('opens and closes start activation modal', function(){
        requester.openStart()
        requester.closeModal()
    });

    it('navigates to products page', function(){
        requester.getProductsPage()
        expect(requester.getProductsComponent().isDisplayed()).toBe(true)
    });

    it('navigates to providers page', function(){
        requester.getProvidersPage()
        expect(requester.getProvidersComponent().isDisplayed()).toBe(true)
    });

    it('checks if page references are working', function(){
        requester.showOrganisations()
        expect(requester.getProvidersComponent().isDisplayed()).toBe(true)

    });
});