var homePage = require('../pages/requester/homePage');
var header = require('../pages/requester/header')
var products = require('../pages/requester/productsPage')
var providers = require('../pages/requester/providersPage')
var utils = require('../pages/utils')


describe('testing basic requester functionality', function() {
    beforeAll(function() {
        utils.setBrowserSize();
        homePage.get()
        utils.clearLocalStorage()
    });

    beforeEach(function() {
        homePage.get()
    });

    it('components should be present', function() {
        expect(homePage.productsBlock.isPresent()).toBe(true)
        expect(homePage.mapBlock.isPresent()).toBe(true)
    });

    it('should opens and close login modal', function() {
        browser.waitForAngular()
        header.loginButton.click()
        browser.ignoreSynchronization = true;
        browser.sleep(1000);
        homePage.closeLoginModal()
        browser.ignoreSynchronization = false;
    });

    it('opens and closes start activation modal', function() {
        homePage.hasElement('start_modal').then(present => {
            if (present) {
                console.log('yes');
                homePage.openStart()
                homePage.closeStartModal()
            }
        });
    });

    it('navigates to products page', function() {
        header.productsPageButton.click()
    });

    describe('products page', function() {
        beforeEach(function() {
            products.get()
        });

        it('products component should be present', function() {
            expect(products.productsComponent.isPresent()).toBe(true)
        });
    });

    it('navigates to providers page', function() {
        header.providersPageButton.click()
    });

    describe('products page', function() {
        beforeEach(function() {
            providers.get()
        });

        it('products component should be present', function() {
            expect(providers.providersComponent.isPresent()).toBe(true)
        });
    });

    it('show organization button should be working', function() {
        homePage.showOrganisations()
    });
});