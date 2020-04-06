var requester = require('../pages/requester/requesterPage');
var utils = require('../pages/utils')

describe('testing basic requester functionality:', function(){
    beforeAll(function(){
        requester.get()
        utils.clearLocalStorage()
    })
     
    beforeEach(function(){
        requester.get()
    })

    it('checks if components are loaded', function(){
        expect(requester.getProductsBlock().isPresent()).toBe(true)
        expect(requester.getMapBlock().isPresent()).toBe(true)
        expect(requester.getStepsBlock().isPresent()).toBe(true)
        expect(requester.getFaqBlock().isPresent()).toBe(true)
    })

    it('opens and closes login modal', function(){
        browser.waitForAngular()
        requester.openLogin()
        browser.ignoreSynchronization = true;
        requester.closeLoginModal()
        browser.ignoreSynchronization = false;
    });

    it('opens and closes start activation modal', function(){
        requester.openStart()
        requester.closeStartModal()
    });

    it('navigates to products page', function(){
        requester.getProductsPage()
        expect(requester.getProductsComponent().isPresent()).toBe(true)
    });

    it('navigates to providers page', function(){
        requester.getProvidersPage()
        expect(requester.getProvidersComponent().isPresent()).toBe(true)
    });

    it('checks if page references are working', function(){
        requester.showOrganisations()
        expect(requester.getProvidersComponent().isPresent()).toBe(true)
    });
});