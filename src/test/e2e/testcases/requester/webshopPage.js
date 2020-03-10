
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
}
module.exports = new webshopPage();