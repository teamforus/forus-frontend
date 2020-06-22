var homePage = require('../pages/provider/homePage');
var utils = require('../pages/utils')

describe('testing unauthenticated provider functionality:', function() {
    beforeAll(function() {
        utils.setBrowserSize();
        homePage.get()
        utils.clearLocalStorage()
    });

    beforeEach(function() {
        homePage.get()
    });

    it('checks if components are loaded', function() {
        expect(homePage.getFaqBlock().isPresent()).toBe(true)
        expect(homePage.getFlowBlock().isPresent()).toBe(true)
    });

    it('should open and close login modal', function() {
        browser.waitForAngular();
        homePage.openLogin()
        browser.ignoreSynchronization = true;
        browser.sleep(1000);
        homePage.closeLoginModal()
        browser.ignoreSynchronization = false;
    });
});