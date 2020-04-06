var dashboardProviderPage = function(){

    this.get = function(){
        browser.get(environment.providerURL + '/#!/organizations')
    }
    
    this.getOffices = function(){
        element(by.id("offices")).click()
    }

    this.getTransactions = function(){
        element(by.id("transactions")).click()
    }

    this.getProducts = function(){
        element(by.id("products")).click()
    }

    this.getEmployees = function(){
        element(by.id("employees")).click()
    }

    this.getProviderFunds = function(){
        element(by.id("funds")).click()
    }
}
module.exports = new dashboardProviderPage();