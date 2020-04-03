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

    this.addOffice = function(){
        element(by.id("create_office")).click()
    }

    this.editOffice = function(){
        element(by.id("edit_office")).click()
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

    this.addEmployee = function(){
        element(by.id("add_employee")).click()
    }

    this.addProduct = function(){
        element(by.id('add_product')).click()
    }

    this.close = function(){
        element(by.id("close")).click()
    }

    this.cancelEditOffice = function(){
        element(by.id("cancel")).click()
    }

    this.cancelAddOffice = function(){
        element(by.id("cancel")).click()
    }

    this.cancelAddProduct = function(){
        element(by.id("cancel_create_product")).click()
    }
}
module.exports = new dashboardProviderPage();