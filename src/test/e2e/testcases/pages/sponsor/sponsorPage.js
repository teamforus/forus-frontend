var sponsorPage = function() {
    this.get = function() {
        browser.get(environment.urls.sponsor)
    }

    this.openLogin = function() {
        element(by.id("login")).click();
    }

    this.openStart = function() {
        element(by.id("start")).click();
    }

    this.closeLoginModal = function() {
        element(by.id("close")).click();
    }

    this.getFaqBlock = function() {
        return element(by.id("faq"))
    }
}

module.exports = new sponsorPage();