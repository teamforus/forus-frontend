var dashboardProviderPage = function(){
    this.setSelectedOrganizationId = function(){
        browser.executeScript("window.localStorage.setItem('selected_organization_id','" + environment.active_organization + "');")
    }

    this.setActiveOrganization = function(){
        browser.executeScript("window.localStorage.setItem('active_organization','" + environment.active_organization + "');")
    }

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