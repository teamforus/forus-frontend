var dashboardProviderPage = function(){
    this.setActiveOrganization = function(){
        browser.executeScript("window.localStorage.setItem('active_organization','" + environment.active_account + "');").
        then(function(){
            browser.refresh();
        })
    }
    this.chooseOrganisation = function(){
        element.all(by.css('[ng-click="$ctrl.chooseOrganization(organization)"]')).first().click()
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
        element(by.id('addProduct')).click()
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
        element(by.id("cancel")).click()
    }
}
module.exports = new dashboardProviderPage();