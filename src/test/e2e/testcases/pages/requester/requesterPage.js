var EC = protractor.ExpectedConditions;

var webshopPage = function() {
    this.get = function() {
        browser.get(environment.urls.requester)
    }

    this.openUserMenu = function() {
        element(by.id("user_menu")).click()
    }

    this.getUserMenuSignOut = function() {
        return element(by.id("sign_out"))
    }
    this.userMenuLoginApp = function() {
        element(by.id("open_pincode_popup")).click()
    }

    this.userMenuActivationCode = function() {
        element(by.id("open_activation_code_popup")).click();
    }

    this.userMenuNotificationPreferences = function() {
        element(by.id("notification_preferences")).click()
    }

    this.disableMailSubscription = function() {    
        return element(by.id("disable_subscription"))
    }

    this.enableMailSubscription = function() {
        return element(by.id("enable_subscription"))
    }

    this.getVouchersPage = function() {
        element(by.id("vouchers")).click();
    }

    this.getVouchersComponent = function() {
        return element(by.id("budget_vouchers"))
    }

    this.closeActivationCodeModal = function() {
        browser.wait(EC.elementToBeClickable(element(by.id("close"))), 3000)
        element(by.id("close")).click()
    }

    this.closePinCodeModal = function() {
        browser.wait(EC.elementToBeClickable(element(by.id("close"))), 3000)
        element(by.id("close")).click()
    }
}

module.exports = new webshopPage();