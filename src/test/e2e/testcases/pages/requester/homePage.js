var HomePage = function(){
    
    this.productsBlock = element(by.id('products'))
    this.stepsBlock = element(by.id('steps'));
    this.mapBlock = element(by.id("map_block"))
    this.faqBlock = element(by.id('faq_block'))
    
    this.get = function(){
        browser.get(environment.customerURL)
    }

    this.closeLoginModal = function(){
        element(by.id("close")).click();
    }

    this.openStart = function(){
        element(by.id("start")).click();
    }

    this.closeStartModal = function(){
        element(by.id("close")).click();
    }

    this.showOrganisations = function(){
        element(by.id('show_map')).click();
    }
}
module.exports = new HomePage();