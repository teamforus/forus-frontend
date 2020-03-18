
var webshopPage = function(){
    this.get = function(){
        browser.get(environment.customerURL)
    }

    this.openLogin = function(){
        element(by.css('[ng-click="openAuthPopup()"]')).click();
    }

    this.openStart = function(){
        element(by.css('[ng-click="$ctrl.openAuthCodePopup()"]')).click();
    }

    this.closeModal = function(){
        element(by.className('modal-close mdi mdi-close')).click();
    }

    this.getProductsPage = function(){
        element(by.binding("'topnavbar.items.products' | translate")).click()
    }

    this.getProductsComponent = function(){
        return element(by.css('[products="::$resolve.products"]'))
    }

    this.getProvidersPage = function(){
        element(by.binding("'topnavbar.items.providers' | translate")).click()
    }

    this.getProvidersComponent = function(){
        return element(by.css('[providers="::$resolve.providers"]'))
    }

    this.getProductsBlock = function(){
        return element(by.id('products'))
    }

    this.getStepsBlock = function(){
        return element(by.id('steps'));
    }
    this.getMapBlock = function(){
        return element(by.className('block block-map'))
    }
    this.getFaqBlock = function(){
        return element(by.css('[ng-if="$ctrl.appConfigs.flags.homeFaq"]'))
    }

    this.showOrganisations = function(){
        element(by.css('[i18n="buttons.show_map"]')).click();
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
        element(by.className("auth-user-avatar")).click()
    }

    this.userMenuSignOut = function(){
        element(by.className('auth-user-menu hide-sm ng-scope ng-isolate-scope active'))
            .element(by.css('[ng-click="$root.signOut()"]')).click()
    }
    this.userMenuLoginApp = function(){
        element(by.className('auth-user-menu hide-sm ng-scope ng-isolate-scope active'))
            .element(by.css('[ng-click="openPinCodePopup()"]')).click()
    }

    this.userMenuActivationCode = function(){
        element(by.className('auth-user-menu hide-sm ng-scope ng-isolate-scope active'))
            .element(by.css('[ng-click="openActivateCodePopup()"]')).click()
    }

    this.userMenuNotificationPreferences = function(){
        element(by.className('auth-user-menu hide-sm ng-scope ng-isolate-scope active'))
            .element(by.css('[ui-sref="preferences-notifications"]')).click()
    }

    this.disableMailSubscription = function(){
        return element(by.css('[ng-click="$ctrl.disableSubscription()"]'))
    }

    this.enableMailSubscription = function(){
        return element(by.css('[ng-click="$ctrl.enableSubscription()"]'))
    }


    this.getVouchersPage = function(){
        element(by.className('auth-code')).click()
    }

    this.getVouchersComponent = function(){
        return element(by.className('budget-vouchers'))
    }

}
module.exports = new webshopPage();