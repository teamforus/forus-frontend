var HomePage = function() {
    this.openLogin = function() {
        element(by.id("login")).click();
    };

    this.get = function() {
        browser.get(environment.urls.provider);
    };

    this.closeLoginModal = function() {
        element(by.id('close')).click();
    };

    this.getFlowBlock = function() {
        return element(by.id("flow"));
    };

    this.getFaqBlock = function() {
        return element(by.id("faq"));
    };
}

module.exports = new HomePage();