var dashboardProviderPage = function(){

    this.get = function(){
        browser.get(environment.urls.provider + '/#!/organizations')
    }
    
    this.getOfficesPage = function(){
        element(by.id("offices")).click()
    }

    this.getTransactionsPage = function(){
        element(by.id("transactions")).click()
    }

    this.getProductsPage = function(){
        element(by.id("products")).click()
    }

    this.getEmployeesPage = function(){
        element(by.id("employees")).click()
    }

    this.getProviderFundsPage = function(){
        element(by.id("funds")).click()
    }
}
module.exports = new dashboardProviderPage();