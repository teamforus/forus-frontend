var webshop = require('./webshopPage');

describe('testing basic functionality:', function(){
    
    beforeEach(function(){
        webshop.get()
    })

    it('checks if components are loaded', function(){
        expect(webshop.getProductsBlock().isPresent()).toBe(true)
        expect(webshop.getMapBlock().isPresent()).toBe(true)
        expect(webshop.getStepsBlock().isPresent()).toBe(true)
        expect(webshop.getFaqBlock().isPresent()).toBe(true)

    })

    it('opens and closes login modal', function(){
        browser.waitForAngular();
        webshop.openLogin()
        browser.ignoreSynchronization = true;
        webshop.closeModal()
        browser.ignoreSynchronization = false;
    });

    it('opens and closes start activation modal', function(){
        webshop.openStart()
        webshop.closeModal()
    });

    it('navigates to products page', function(){
        webshop.getProductsPage()
        expect(webshop.getProductsComponent().isPresent()).toBe(true)
    });

    it('navigates to providers page', function(){
        webshop.getProvidersPage()
        expect(webshop.getProvidersComponent().isPresent()).toBe(true)
    });

    it('checks if page references are working', function(){
        webshop.showOrganisations()
        expect(webshop.getProvidersComponent().isPresent()).toBe(true)

    });
});