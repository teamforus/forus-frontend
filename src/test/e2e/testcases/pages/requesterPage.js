
var webshopPage = function(){
    this.get = function(){
        browser.get(environment.customerURL)
    }

    this.openLogin = function(){
        element(by.id("login")).click();
    }

    this.openStart = function(){
        element(by.id("start")).click();
    }

    this.closeStartModal = function(){
        element(by.id("close")).click();
    }

    this.closeLoginModal = function(){
        element(by.id("close")).click();
    }

    this.getProductsPage = function(){
        element(by.id("products_page")).click()
    }

    this.getProductsComponent = function(){
        return element(by.id("products_list"))
    }

    this.getProvidersPage = function(){
        element(by.id("providers_page")).click()
    }

    this.getProvidersComponent = function(){
        return element(by.id("providers_list"))
    }

    this.getProductsBlock = function(){
        return element(by.id('products'))
    }

    this.getStepsBlock = function(){
        return element(by.id('steps'));
    }
    this.getMapBlock = function(){
        return element(by.id("map_block"))
    }
    this.getFaqBlock = function(){
        return element(by.id('faq_block'))
    }

    this.showOrganisations = function(){
        element(by.id('show_map')).click();
    }

    this.clearLocalStorage = function(){
        browser.executeScript("window.localStorage.clear()")
        .then(function(){
            browser.refresh();
        });
    }

    this.setActiveAccount = function(){
        browser.executeScript("window.localStorage.setItem('active_account','" + environment.active_account + "');").
        then(function(){
            browser.refresh();
        });
    };

    this.openUserMenu = function(){
        element(by.id("user_menu")).click()
    }

    this.getUserMenuSignOut = function(){
        return element(by.id("sign_out"))
    }
    this.userMenuLoginApp = function(){
        element(by.id("open_pincode_popup")).click()
    }

    this.userMenuActivationCode = function(){
        element(by.id("open_activation_code_popup")).click()
    }

    this.userMenuNotificationPreferences = function(){
        element(by.id("notification_preferences")).click()
    }

    this.disableMailSubscription = function(){
        return element(by.id("disable_subscription"))
    }

    this.enableMailSubscription = function(){
        return element(by.id("enable_subscription"))
    }

    this.getVouchersPage = function(){
        element(by.id("vouchers")).click()
    }

    this.getVouchersComponent = function(){
        return element(by.id("budget_vouchers"))
    }

    this.closeActivationCodeModal = function(){
        element(by.id("close")).click();
    }

    this.closePinCodeModal = function(){
        element(by.id("close")).click();
    }
}
module.exports = new webshopPage();